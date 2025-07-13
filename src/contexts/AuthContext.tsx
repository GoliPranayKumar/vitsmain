
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
  const [location, setLocation] = useLocation();

  useEffect(() => {
    console.log('Setting up auth state listener');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('User logged in, loading profile...');
          // Use setTimeout to avoid blocking the auth state change
          setTimeout(() => {
            loadUserProfile(session.user.id);
          }, 100);
        } else {
          console.log('User logged out, clearing profile');
          setUserProfile(null);
          setNeedsProfileCreation(false);
          setLoading(false);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
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
    if (!userId) {
      setLoading(false);
      return;
    }

    console.log('Loading profile for user:', userId);

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        setUserProfile(null);
        setNeedsProfileCreation(true);
        setLoading(false);
        return;
      }

      if (data) {
        console.log('Profile loaded successfully:', data);
        setUserProfile(data);
        setNeedsProfileCreation(false);
        
        // Handle redirection based on role and current location
        console.log('Current location:', location);
        console.log('User role:', data.role, 'Status:', data.status);
        
        // Only redirect if we're on the home page (to avoid interfering with direct navigation)
        if (location === '/') {
          if (data.role === 'admin') {
            console.log('Redirecting admin to admin dashboard');
            setTimeout(() => {
              setLocation('/admin-dashboard');
            }, 500);
          } else if (data.role === 'student' && data.status === 'approved') {
            console.log('Redirecting approved student to student dashboard');
            setTimeout(() => {
              setLocation('/student-dashboard');
            }, 500);
          } else if (data.role === 'student' && data.status === 'pending') {
            console.log('Student pending approval, staying on main page');
            // Student stays on main page
          }
        }
      } else {
        console.log('No profile found, needs creation');
        setUserProfile(null);
        setNeedsProfileCreation(true);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUserProfile(null);
      setNeedsProfileCreation(true);
    } finally {
      setLoading(false);
    }
  };

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
        // Profile loading and redirection will happen in the auth state change handler
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
        // Create initial profile
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

        if (userType === 'student') {
          setNeedsProfileCreation(true);
        }
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
          ...profileData,
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
