
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: any;
  login: (email: string, password: string, userType: 'student' | 'admin') => Promise<void>;
  signUp: (email: string, password: string, userType: 'student' | 'admin') => Promise<{ error: any }>;
  logout: () => Promise<void>;
  loading: boolean;
  needsProfileCreation: boolean;
  createProfile: (profileData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [needsProfileCreation, setNeedsProfileCreation] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile loading to avoid callback issues
          setTimeout(() => {
            loadUserProfile(session.user.id);
          }, 0);
        } else {
          setUserProfile(null);
          setNeedsProfileCreation(false);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => {
          loadUserProfile(session.user.id);
        }, 0);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await (supabase as any)
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found, user needs to create one
          setNeedsProfileCreation(true);
          setUserProfile(null);
        } else {
          console.error('Error loading user profile:', error);
        }
      } else if (data) {
        console.log('User profile loaded:', data);
        setUserProfile(data as any);
        setNeedsProfileCreation(false);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const login = async (email: string, password: string, userType: 'student' | 'admin') => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        throw error;
      }

      if (data.user) {
        // Check if user has the correct role
        await loadUserProfile(data.user.id);
        toast({
          title: "Login successful",
          description: `Welcome back!`,
        });
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
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        return { error };
      }

      if (data.user) {
        // Create initial user profile
        const { error: profileError } = await (supabase as any)
          .from('user_profiles')
          .insert({
            id: data.user.id,
            role: userType,
            status: userType === 'student' ? 'pending' : 'approved'
          });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
        }

        toast({
          title: "Account created successfully",
          description: userType === 'student' 
            ? "Please complete your profile. Admin approval may be required." 
            : "Your admin account has been created.",
        });
      }

      return { error: null };
    } catch (error: any) {
      console.error('Sign up failed:', error);
      return { error };
    }
  };

  const createProfile = async (profileData: any) => {
    try {
      if (!user) throw new Error('No authenticated user');

      const { error } = await (supabase as any)
        .from('user_profiles')
        .update({
          ...(profileData as any),
          status: 'pending'
        })
        .eq('id', user.id);

      if (error) throw error;

      await loadUserProfile(user.id);
      toast({
        title: "Profile created successfully",
        description: "Your profile is pending admin approval.",
      });
    } catch (error: any) {
      console.error('Error creating profile:', error);
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
      
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of your account.",
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      throw error;
    }
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
