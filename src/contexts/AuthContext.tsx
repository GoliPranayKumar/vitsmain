
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [needsProfileCreation, setNeedsProfileCreation] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleRedirection = (profile: UserProfile) => {
    console.log('Handling redirection for profile:', profile);
    
    if (profile.role === 'admin') {
      console.log('Redirecting admin to dashboard');
      setLocation('/admin-dashboard');
    } else if (profile.role === 'student') {
      if (profile.status === 'approved') {
        console.log('Redirecting approved student to dashboard');
        setLocation('/student-dashboard');
      } else {
        console.log('Student pending approval, staying on main page');
        setLocation('/');
      }
    }
  };

  const loadUserProfile = async (userId: string) => {
    console.log('Loading profile for user:', userId);

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      console.log('Profile query result:', { data, error });

      if (error) {
        console.error('Error loading profile:', error);
        setUserProfile(null);
        setNeedsProfileCreation(false);
        return;
      }

      if (!data) {
        console.log('No profile found - user needs profile creation');
        setUserProfile(null);
        setNeedsProfileCreation(true);
        return;
      }

      console.log('Profile loaded successfully:', data);
      setUserProfile(data);
      setNeedsProfileCreation(false);
      
      // Handle redirection after profile is loaded
      handleRedirection(data);
    } catch (error) {
      console.error('Exception loading user profile:', error);
      setUserProfile(null);
      setNeedsProfileCreation(false);
    }
  };

  useEffect(() => {
    console.log('Setting up auth state listener');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('User authenticated, loading profile...');
          // Use setTimeout to avoid blocking the auth state change
          setTimeout(() => {
            loadUserProfile(session.user.id).finally(() => {
              setLoading(false);
            });
          }, 0);
        } else {
          console.log('User logged out, clearing profile');
          setUserProfile(null);
          setNeedsProfileCreation(false);
          setLoading(false);
        }
      }
    );

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session check:', session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string, userType: 'student' | 'admin') => {
    console.log('Attempting login for:', email, userType);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        console.error('Login error:', error);
        throw error;
      }

      if (data.user) {
        console.log('Login successful for:', data.user.email);
        toast({ 
          title: 'Login successful', 
          description: 'Welcome back!' 
        });
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, userType: 'student' | 'admin') => {
    console.log('Attempting signup for:', email, userType);
    
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

      if (error) {
        console.error('Signup error:', error);
        return { error };
      }

      console.log('Signup successful:', data);

      if (data.user) {
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            role: userType,
            status: userType === 'admin' ? 'approved' : 'pending',
            student_name: data.user.email?.split('@')[0] || 'User',
          });

        if (insertError) {
          console.error('Error inserting profile:', insertError);
        } else {
          console.log('Profile created successfully');
        }

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

    console.log('Creating profile for user:', user.id, profileData);

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

      if (error) {
        console.error('Error creating profile:', error);
        throw error;
      }

      console.log('Profile created successfully');
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
    console.log('Logging out user');
    
    try {
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
