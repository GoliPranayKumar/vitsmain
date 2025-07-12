import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: any;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [needsProfileCreation, setNeedsProfileCreation] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setUserProfile(null);
          setNeedsProfileCreation(false);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) loadUserProfile(session.user.id);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      // Admins may not have user_profiles row
      const { data: userData } = await supabase.auth.getUser();
      const roleFromMeta = userData.user?.user_metadata?.role;

      if (roleFromMeta === 'admin') {
        setUserProfile({ role: 'admin' });
        setNeedsProfileCreation(false);
      } else {
        setUserProfile(null);
        setNeedsProfileCreation(true);
      }
    } else {
      setUserProfile(data);
      setNeedsProfileCreation(false);
    }
  };

  const login = async (email: string, password: string, userType: 'student' | 'admin') => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    if (data.user) {
      toast({ title: 'Login successful', description: 'Welcome back!' });
      await loadUserProfile(data.user.id);
    }
  };

  const signUp = async (email: string, password: string, userType: 'student' | 'admin') => {
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

    if (data.user && userType === 'student') {
      const { error: insertError } = await supabase.from('user_profiles').insert({
        id: data.user.id,
        role: userType,
        status: 'pending',
      });

      if (insertError) {
        console.error('Error inserting student profile:', insertError);
      }

      toast({
        title: 'Account created',
        description: 'Please complete your profile. Awaiting admin approval.',
      });

      setNeedsProfileCreation(true);
    } else {
      toast({
        title: 'Admin account created',
        description: 'You can now access the admin dashboard.',
      });
      setNeedsProfileCreation(false);
    }

    return { error: null };
  };

  const createProfile = async (profileData: any) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_profiles')
      .update({
        ...profileData,
        status: 'pending',
      })
      .eq('id', user.id);

    if (error) throw error;

    await loadUserProfile(user.id);
    toast({
      title: 'Profile submitted',
      description: 'Your profile is pending admin approval.',
    });
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    setUser(null);
    setSession(null);
    setUserProfile(null);
    setNeedsProfileCreation(false);

    toast({
      title: 'Logged out',
      description: 'You have been signed out.',
    });
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
