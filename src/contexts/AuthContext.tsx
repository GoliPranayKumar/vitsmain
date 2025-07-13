import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface UserProfile {
  id: string;
  role: string;
  status: string;
  student_name: string | null;
  ht_no: string | null;
  year: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  needsProfileCreation: boolean;
  login: (email: string, password: string, userType: 'student' | 'admin') => Promise<void>;
  signUp: (
    email: string,
    password: string,
    userType: 'student' | 'admin',
    ht_no?: string
  ) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  createProfile: (profileData: { ht_no: string; student_name: string; year: string }) => Promise<void>;
  closeProfileCreationModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [needsProfileCreation, setNeedsProfileCreation] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Debug helper to trace flow
  const debugLog = (...args: any[]) => {
    // Remove or comment this line if you want quiet logs
    console.log('[AuthContext]', ...args);
  };

  const loadUserProfile = async (userId: string): Promise<UserProfile | null> => {
    debugLog('Loading user profile for userId:', userId);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        debugLog('Error loading user profile:', error);
        setNeedsProfileCreation(true);
        return null;
      }

      if (!data) {
        debugLog('No user profile found, user needs to create profile');
        setNeedsProfileCreation(true);
        return null;
      }

      debugLog('User profile loaded:', data);
      setNeedsProfileCreation(false);
      return data;
    } catch (err) {
      debugLog('Exception loading user profile:', err);
      setNeedsProfileCreation(true);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;
    let listenerSubscription: any = null;

    const initAuth = async () => {
      debugLog('Initializing auth...');
      setLoading(true);
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          debugLog('Error fetching initial session:', error);
          return;
        }

        if (!isMounted) return;

        debugLog('Initial session:', session);

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const profile = await loadUserProfile(session.user.id);
          if (!isMounted) return;

          setUserProfile(profile);
        } else {
          setUserProfile(null);
          setNeedsProfileCreation(false);
        }
      } catch (error) {
        debugLog('Exception in initAuth:', error);
        setUserProfile(null);
        setNeedsProfileCreation(false);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      debugLog('Auth state changed:', _event, session);
      if (!isMounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const profile = await loadUserProfile(session.user.id);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
        setNeedsProfileCreation(false);
      }
    });

    listenerSubscription = listener?.subscription;

    return () => {
      isMounted = false;
      if (listenerSubscription) listenerSubscription.unsubscribe();
      debugLog('Auth context unmounted and listener unsubscribed');
    };
  }, []);

  const login = async (email: string, password: string, userType: 'student' | 'admin') => {
    try {
      debugLog('Attempting login for', email, 'as', userType);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (data.user) {
        debugLog('Login successful, loading profile...');
        const profile = await loadUserProfile(data.user.id);
        setUser(data.user);
        setUserProfile(profile);

        if (profile?.role === 'admin') {
          setLocation('/admin-dashboard');
        } else if (profile?.role === 'student') {
          if (profile.status === 'approved') {
            setLocation('/student-dashboard');
          } else {
            toast({
              title: 'Pending Approval',
              description: 'Your profile is awaiting admin approval.',
            });
            setLocation('/');
          }
        } else {
          setNeedsProfileCreation(true);
          setLocation('/');
        }

        toast({ title: 'Login successful', description: 'Welcome back!' });
      }
    } catch (err: any) {
      debugLog('Login failed:', err);
      toast({ title: 'Login failed', description: err.message || 'Unknown error' });
      throw err;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    userType: 'student' | 'admin',
    ht_no?: string
  ): Promise<{ error: any }> => {
    try {
      debugLog('Signing up user:', email, userType, ht_no);
      let verified: any = null;

      if (userType === 'student') {
        const { data, error: verifyError } = await supabase
          .from('verified_students')
          .select('*')
          .eq('ht_no', ht_no)
          .maybeSingle();

        if (verifyError || !data) {
          debugLog('Verification failed for ht_no:', ht_no, verifyError);
          return {
            error: {
              message: 'Hall ticket not found in verified students. Contact admin.',
            },
          };
        }

        verified = data;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role: userType },
        },
      });

      if (error) return { error };

      if (data.user) {
        const insertData: any = {
          id: data.user.id,
          role: userType,
          status: userType === 'admin' ? 'approved' : 'pending',
        };

        if (userType === 'student') {
          insertData.ht_no = ht_no;
          insertData.student_name = verified?.student_name || email.split('@')[0];
          insertData.year = verified?.year?.toString() || null;
        }

        const { error: insertError } = await supabase.from('user_profiles').insert(insertData);

        if (insertError) {
          debugLog('Error inserting user profile:', insertError);
          return { error: insertError };
        }

        toast({
          title: 'Account created',
          description:
            userType === 'admin'
              ? 'Admin account created successfully.'
              : 'Account created. Please wait for admin approval.',
        });
      }

      return { error: null };
    } catch (error: any) {
      debugLog('Signup failed:', error);
      return { error };
    }
  };

  const createProfile = async (profileData: {
    ht_no: string;
    student_name: string;
    year: string;
  }) => {
    if (!user) throw new Error('User not authenticated');

    debugLog('Creating/updating profile:', profileData);

    const { error } = await supabase
      .from('user_profiles')
      .update({
        ht_no: profileData.ht_no,
        student_name: profileData.student_name,
        year: profileData.year.toString(),
        status: 'pending',
      })
      .eq('id', user.id);

    if (error) {
      debugLog('Error updating profile:', error);
      throw error;
    }

    const updated = await loadUserProfile(user.id);
    setUserProfile(updated);
    setNeedsProfileCreation(false);

    toast({
      title: 'Profile submitted',
      description: 'Your profile is pending admin approval.',
    });
  };

  const closeProfileCreationModal = () => {
    debugLog('Profile creation modal closed by user');
    setNeedsProfileCreation(false);
  };

  const logout = async () => {
    debugLog('Logging out...');
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserProfile(null);
    setNeedsProfileCreation(false);
    setLocation('/');

    toast({ title: 'Logged out', description: 'You have been signed out.' });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userProfile,
        loading,
        needsProfileCreation,
        login,
        signUp,
        logout,
        createProfile,
        closeProfileCreationModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
