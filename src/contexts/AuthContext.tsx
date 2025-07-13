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
  signUp: (email: string, password: string, userType: 'student' | 'admin') => Promise<{ error: any }>;
  logout: () => Promise<void>;
  createProfile: (profileData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

const DEMO_EMAILS = [
  'student@vignanits.ac.in',
  'admin@vignanits.ac.in'
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [needsProfileCreation, setNeedsProfileCreation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [redirectPending, setRedirectPending] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleRedirection = (profile: UserProfile) => {
    if (profile.role === 'admin') {
      setLocation('/admin-dashboard');
    } else if (profile.role === 'student') {
      if (profile.status === 'approved') {
        setLocation('/student-dashboard');
      } else {
        setLocation('/');
      }
    }
  };

  const loadUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error loading profile:', error);
        setUserProfile(null);
        setNeedsProfileCreation(false);
        return null;
      }

      if (!data) {
        setUserProfile(null);
        const isDemo = DEMO_EMAILS.includes(user?.email ?? '');
        const isStudent = user?.user_metadata?.role === 'student';
        setNeedsProfileCreation(redirectPending && !isDemo && isStudent);
        return null;
      }

      setUserProfile(data);
      setNeedsProfileCreation(false);
      return data;
    } catch (error) {
      console.error('Exception loading user profile:', error);
      setUserProfile(null);
      setNeedsProfileCreation(false);
      return null;
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          loadUserProfile(session.user.id).then((profile) => {
            if (redirectPending && profile) {
              handleRedirection(profile);
              setRedirectPending(false);
            }
          }).finally(() => setLoading(false));
        } else {
          setUserProfile(null);
          setNeedsProfileCreation(false);
          setLoading(false);
        }
      }
    );

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setNeedsProfileCreation(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => subscription.unsubscribe();
  }, [redirectPending]);

  const login = async (email: string, password: string, userType: 'student' | 'admin') => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      setRedirectPending(true);

      if (data.user) {
        toast({ title: 'Login successful', description: 'Welcome back!' });
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, userType: 'student' | 'admin') => {
    try {
      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { role: userType },
        },
      });

      if (error) return { error };

      if (data.user) {
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            role: userType,
            status: userType === 'admin' ? 'approved' : 'pending',
            student_name: data.user.email?.split('@')[0] || 'User',
          });

        if (insertError) console.error('Error inserting profile:', insertError);

        toast({
          title: 'Account created',
          description: userType === 'admin'
            ? 'Admin account created successfully!'
            : 'Please complete your profile. Awaiting admin approval.',
        });
      }

      return { error: null };
    } catch (error: any) {
      console.error('Signup failed:', error);
      return { error };
    }
  };

  const createProfile = async (profileData: any) => {
    if (!user) throw new Error('User not authenticated');

    try {
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

      await loadUserProfile(user.id);

      toast({
        title: 'Profile submitted',
        description: 'Your profile is pending admin approval.',
      });
    } catch (error) {
      console.error('Profile creation failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setSession(null);
      setUserProfile(null);
      setNeedsProfileCreation(false);
      setRedirectPending(false);
      setLocation('/');

      toast({
        title: 'Logged out',
        description: 'You have been signed out.',
      });
    } catch (error) {
      console.error('Logout error:', error);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
