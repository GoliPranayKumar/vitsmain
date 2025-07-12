import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Define profile structure
export interface UserProfile {
  id: string;
  htno?: string;
  student_name?: string;
  year?: string;
  role: 'student' | 'admin';
  status: 'pending' | 'approved';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  login: (email: string, password: string, userType: 'student' | 'admin') => Promise<void>;
  signUp: (email: string, password: string, userType: 'student' | 'admin') => Promise<{ error: any }>;
  logout: () => Promise<void>;
  loading: boolean;
  needsProfileCreation: boolean;
  createProfile: (profileData: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsProfileCreation, setNeedsProfileCreation] = useState(false);
  const { toast } = useToast();

  // Load user profile
  const loadUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      setUserProfile(null);
      setNeedsProfileCreation(true);
    } else {
      setUserProfile(data as UserProfile);
      setNeedsProfileCreation(false);
    }
  };

  // Auth state listener
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setSession(session ?? null);
        if (currentUser) await loadUserProfile(currentUser.id);
        else {
          setUserProfile(null);
          setNeedsProfileCreation(false);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data }) => {
      const currentUser = data.session?.user ?? null;
      setUser(currentUser);
      setSession(data.session ?? null);
      if (currentUser) loadUserProfile(currentUser.id);
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Login logic
  const login = async (email: string, password: string, userType: 'student' | 'admin') => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    if (data.user) {
      await loadUserProfile(data.user.id);
      toast({ title: 'Login successful', description: 'Welcome back!' });
    }
  };

  // Sign up logic with student verification
  const signUp = async (email: string, password: string, userType: 'student' | 'admin') => {
    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl },
    });

    if (error) return { error };

    if (data.user) {
      if (userType === 'student') {
        const rollNumber = email.split('@')[0]; // Assuming email starts with HT No.

        const { data: verified, error: verifyError } = await supabase
          .from('verified_students')
          .select('*')
          .eq('H.T No.', rollNumber)
          .single();

        if (verifyError || !verified) {
          return { error: { message: 'You are not in the verified students list.' } };
        }

        const { error: profileError } = await supabase.from('user_profiles').insert({
          id: data.user.id,
          htno: verified['H.T No.'],
          student_name: verified['Student Name'],
          year: verified['Year'],
          role: 'student',
          status: 'pending',
        });

        if (profileError) console.error('Error inserting student profile:', profileError);
      } else {
        await supabase.from('user_profiles').insert({
          id: data.user.id,
          role: 'admin',
          status: 'approved',
        });
      }

      toast({
        title: 'Account created',
        description:
          userType === 'student'
            ? 'Student account created. Profile pending admin approval.'
            : 'Admin account created successfully.',
      });
    }

    return { error: null };
  };

  // Create/Update profile
  const createProfile = async (profileData: Partial<UserProfile>) => {
    if (!user) throw new Error('User not logged in');

    const { error } = await supabase
      .from('user_profiles')
      .update({ ...profileData, status: 'pending' })
      .eq('id', user.id);

    if (error) throw error;

    await loadUserProfile(user.id);

    toast({
      title: 'Profile updated',
      description: 'Your profile is pending admin approval.',
    });
  };

  // Logout
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    setUser(null);
    setSession(null);
    setUserProfile(null);
    setNeedsProfileCreation(false);

    toast({
      title: 'Logged out',
      description: 'You have been signed out successfully.',
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userProfile,
        login,
        signUp,
        logout,
        loading,
        needsProfileCreation,
        createProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
