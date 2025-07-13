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
  createProfile: (profileData: any) => Promise<void>;
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

  // Fetch user profile from Supabase table user_profiles by userId
  const loadUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('[loadUserProfile] Supabase error:', error);
        return null;
      }

      return data || null;
    } catch (err) {
      console.error('[loadUserProfile] Exception:', err);
      return null;
    }
  };

  // Initialization and subscription to auth changes
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      setLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const profile = await loadUserProfile(session.user.id);
          if (!isMounted) return;

          setUserProfile(profile);
          setNeedsProfileCreation(profile === null);
        } else {
          setUserProfile(null);
          setNeedsProfileCreation(false);
        }
      } catch (error) {
        console.error('[AuthProvider] Initialization error:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initialize();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;

      setLoading(true);

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const profile = await loadUserProfile(session.user.id);
        if (!isMounted) return;

        setUserProfile(profile);
        setNeedsProfileCreation(profile === null);
      } else {
        setUserProfile(null);
        setNeedsProfileCreation(false);
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // Login method with redirection and toast
  const login = async (email: string, password: string, userType: 'student' | 'admin') => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      if (data.user) {
        const profile = await loadUserProfile(data.user.id);
        setUser(data.user);
        setUserProfile(profile);
        setNeedsProfileCreation(profile === null);

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
          // No profile or unknown role - show create profile modal
          setNeedsProfileCreation(true);
          setLocation('/');
        }

        toast({ title: 'Login successful', description: 'Welcome back!' });
      }
    } catch (err: any) {
      toast({ title: 'Login failed', description: err.message || 'Unknown error' });
      throw err;
    }
  };

  // Signup method verifies student ht_no and inserts user_profile
  const signUp = async (
    email: string,
    password: string,
    userType: 'student' | 'admin',
    ht_no?: string
  ) => {
    try {
      let verifiedStudent: any = null;

      if (userType === 'student') {
        const { data, error: verifyError } = await supabase
          .from('verified_students')
          .select('*')
          .eq('ht_no', ht_no)
          .maybeSingle();

        if (verifyError || !data) {
          return {
            error: {
              message: 'Hall ticket not found in verified students. Contact admin.',
            },
          };
        }

        verifiedStudent = data;
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
          insertData.student_name = verifiedStudent?.student_name || email.split('@')[0];
          insertData.year = verifiedStudent?.year?.toString() || null;
        }

        const { error: insertError } = await supabase.from('user_profiles').insert(insertData);

        if (insertError) {
          console.error('[signUp] Insert profile error:', insertError);
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
      console.error('[signUp] Signup failed:', error);
      return { error };
    }
  };

  // Create or update profile and reset modal state
  const createProfile = async (profileData: any) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_profiles')
      .update({
        ht_no: profileData.ht_no,
        student_name: profileData.student_name,
        year: profileData.year.toString(),
        status: 'pending',
      })
      .eq('id', user.id);

    if (error) throw error;

    const updatedProfile = await loadUserProfile(user.id);
    setUserProfile(updatedProfile);
    setNeedsProfileCreation(false);

    toast({
      title: 'Profile submitted',
      description: 'Your profile is pending admin approval.',
    });
  };

  // Close the profile creation modal forcibly (cancel)
  const closeProfileCreationModal = () => {
    setNeedsProfileCreation(false);
  };

  // Logout and clear state
  const logout = async () => {
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
