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
  email?: string | null;
  phone?: string | null;
  section?: string | null;
  semester?: string | null;
  cgpa?: string | null;
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

  // Helper: Fetch user profile by auth user id
  const loadUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log('[Auth] loadUserProfile: querying for userId:', userId);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('[Auth] loadUserProfile error:', error);
        return null;
      }

      console.log('[Auth] loadUserProfile data:', data);
      return data || null;
    } catch (error) {
      console.error('[Auth] loadUserProfile exception:', error);
      return null;
    }
  };

  // Initialize auth state on app load
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      console.log('[Auth] Initializing auth...');
      setLoading(true);
      try {
        const { data } = await supabase.auth.getSession();
        const currentSession = data.session;
        if (!isMounted) return;

        console.log('[Auth] Current session:', currentSession);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          const profile = await loadUserProfile(currentSession.user.id);
          setUserProfile(profile);

          if (!profile && currentSession.user.user_metadata?.role === 'student') {
            console.log('[Auth] No profile found for student, needs creation.');
            setNeedsProfileCreation(true);
          } else {
            setNeedsProfileCreation(false);
          }
        } else {
          setUserProfile(null);
          setNeedsProfileCreation(false);
        }
      } catch (error) {
        console.error('[Auth] Failed to initialize auth:', error);
        setUser(null);
        setUserProfile(null);
        setNeedsProfileCreation(false);
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log('[Auth] Auth initialization complete.');
        }
      }
    };

    initAuth();

    // Listen for auth state changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('[Auth] Auth state changed:', _event, session);
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const profile = await loadUserProfile(session.user.id);
        setUserProfile(profile);

        if (!profile && session.user.user_metadata?.role === 'student') {
          setNeedsProfileCreation(true);
          console.log('[Auth] User logged in without profile, prompt creation.');
        } else {
          setNeedsProfileCreation(false);
        }
      } else {
        setUserProfile(null);
        setNeedsProfileCreation(false);
      }
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
      console.log('[Auth] Cleaned up auth listener.');
    };
  }, []);

  // Login method for both students and admins
  const login = async (email: string, password: string, userType: 'student' | 'admin') => {
    try {
      console.log('[Auth] Attempting login for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (data.user) {
        const profile = await loadUserProfile(data.user.id);
        setUser(data.user);
        setUserProfile(profile);

        if (!profile && userType === 'student') {
          setNeedsProfileCreation(true);
          toast({ title: 'Create your profile', description: 'Complete your student profile.' });
          return;
        }

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
        }

        toast({ title: 'Login successful', description: 'Welcome back!' });
        console.log('[Auth] Login successful for:', email);
      }
    } catch (err: any) {
      toast({ title: 'Login failed', description: err.message || 'Unknown error' });
      console.error('[Auth] Login failed:', err);
      throw err;
    }
  };

  // Signup method for students/admins with verified_students check for students
  const signUp = async (
    email: string,
    password: string,
    userType: 'student' | 'admin',
    ht_no?: string
  ): Promise<{ error: any }> => {
    try {
      console.log('[Auth] Signup attempt:', email, userType);

      let verified: any = null;

      if (userType === 'student') {
        const { data, error: verifyError } = await supabase
          .from('verified_students')
          .select('*')
          .eq('ht_no', ht_no)
          .maybeSingle();

        if (verifyError || !data) {
          const msg = 'Hall ticket not found in verified students. Contact admin.';
          console.warn('[Auth] Verification failed:', msg);
          return { error: { message: msg } };
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

      if (error) {
        console.error('[Auth] Signup error:', error);
        return { error };
      }

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
          console.error('[Auth] Error inserting user profile:', insertError);
          return { error: insertError };
        }

        toast({
          title: 'Account created',
          description:
            userType === 'admin'
              ? 'Admin account created successfully.'
              : 'Account created. Please wait for admin approval.',
        });

        console.log('[Auth] Signup success for:', email);
      }

      return { error: null };
    } catch (error: any) {
      console.error('[Auth] Signup unexpected error:', error);
      return { error };
    }
  };

  // Create profile for student after signup
  const createProfile = async (profileData: {
    ht_no: string;
    student_name: string;
    year: string;
  }) => {
    if (!user) {
      const errMsg = 'User not authenticated for profile creation';
      console.error('[Auth] ' + errMsg);
      throw new Error(errMsg);
    }

    try {
      console.log('[Auth] Creating profile for user:', user.id, profileData);

      const { error } = await supabase
        .from('user_profiles')
        .update({
          ht_no: profileData.ht_no,
          student_name: profileData.student_name,
          year: profileData.year,
          status: 'pending',
        })
        .eq('id', user.id);

      if (error) {
        console.error('[Auth] Error updating profile:', error);
        throw error;
      }

      const updatedProfile = await loadUserProfile(user.id);
      setUserProfile(updatedProfile);
      setNeedsProfileCreation(false);

      toast({
        title: 'Profile submitted',
        description: 'Your profile is pending admin approval.',
      });

      console.log('[Auth] Profile creation complete.');
    } catch (error) {
      console.error('[Auth] Profile creation failed:', error);
      throw error;
    }
  };

  const closeProfileCreationModal = () => {
    console.log('[Auth] Closing profile creation modal.');
    setNeedsProfileCreation(false);
  };

  // Logout method
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setUserProfile(null);
      setNeedsProfileCreation(false);
      setLocation('/');
      toast({ title: 'Logged out', description: 'You have been signed out.' });
      console.log('[Auth] User logged out.');
    } catch (error) {
      console.error('[Auth] Logout failed:', error);
      toast({ title: 'Logout failed', description: 'Please try again.' });
    }
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
