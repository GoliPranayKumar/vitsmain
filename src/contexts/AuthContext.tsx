
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

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
  const [, setLocation] = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
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
      console.log('Initial session:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    if (!userId) return;

    console.log('Loading profile for user:', userId);

    const { data, error } = await (supabase as any)
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.log('No profile found, checking user metadata');
      // Check if this is an admin user
      const { data: userData } = await supabase.auth.getUser();
      const roleFromMeta = userData.user?.user_metadata?.role;

      if (roleFromMeta === 'admin') {
        console.log('Admin user detected');
        setUserProfile({ role: 'admin' });
        setNeedsProfileCreation(false);
        // Redirect admin to dashboard
        setTimeout(() => setLocation('/admin-dashboard'), 100);
      } else {
        console.log('Student user needs profile creation');
        setUserProfile(null);
        setNeedsProfileCreation(true);
      }
    } else {
      console.log('Profile loaded:', data);
      setUserProfile(data);
      setNeedsProfileCreation(false);
      
      // Redirect based on role and status
      if (data.role === 'admin') {
        setTimeout(() => setLocation('/admin-dashboard'), 100);
      } else if (data.role === 'student' && data.status === 'approved') {
        setTimeout(() => setLocation('/student-dashboard'), 100);
      }
      // If student is pending, they stay on main page with profile creation modal
    }
  };

  const login = async (email: string, password: string, userType: 'student' | 'admin') => {
    console.log('Attempting login for:', email, userType);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Login error:', error);
      throw error;
    }

    if (data.user) {
      console.log('Login successful for:', data.user.email);
      toast({ title: 'Login successful', description: 'Welcome back!' });
      // Profile loading and redirection will happen in the auth state change handler
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
      const { error: insertError } = await (supabase as any).from('user_profiles').insert({
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
    } else if (data.user && userType === 'admin') {
      toast({
        title: 'Admin account created',
        description: 'You can now access the admin dashboard.',
      });
      setNeedsProfileCreation(false);
      // Admin will be redirected by the auth state change handler
    }

    return { error: null };
  };

  const createProfile = async (profileData: any) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await (supabase as any)
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
    setLocation('/');

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
