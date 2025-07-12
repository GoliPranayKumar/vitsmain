
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'student';
  name: string;
  htno?: string;
  student_name?: string;
  year?: number;
  status?: 'pending' | 'approved' | 'rejected';
}

interface AuthContextType {
  user: UserProfile | null;
  login: (email: string, password: string, userType: 'admin' | 'student') => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  needsProfile: boolean;
  createProfile: (profileData: { htno: string; student_name: string; year: number }) => Promise<void>;
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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleUserSession(session.user);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await handleUserSession(session.user);
      } else {
        setUser(null);
        setNeedsProfile(false);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUserSession = async (authUser: User) => {
    try {
      // Check if user has a profile
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        setIsLoading(false);
        return;
      }

      if (!profile) {
        // User needs to create profile
        setNeedsProfile(true);
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          role: 'student',
          name: authUser.email || 'Student'
        });
      } else {
        // User has profile
        setNeedsProfile(false);
        setUser({
          id: profile.id,
          email: authUser.email || '',
          role: profile.role as 'admin' | 'student',
          name: profile.student_name || profile.role === 'admin' ? 'Admin User' : 'Student',
          htno: profile.htno,
          student_name: profile.student_name,
          year: profile.year,
          status: profile.status
        });

        // Redirect based on role and status
        if (profile.role === 'admin') {
          setLocation('/admin-dashboard');
        } else if (profile.status === 'approved') {
          setLocation('/student-dashboard');
        }
      }
    } catch (error) {
      console.error('Error in handleUserSession:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, userType: 'admin' | 'student') => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Session handling will be done by the auth state change listener
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createProfile = async (profileData: { htno: string; student_name: string; year: number }) => {
    if (!user) throw new Error('No authenticated user');

    try {
      // Validate against verified_students table
      const { data: verifiedStudent, error: verifyError } = await supabase
        .from('verified_students')
        .select('*')
        .eq('H.T No.', profileData.htno)
        .eq('Student Name', profileData.student_name)
        .eq('Year', profileData.year.toString())
        .single();

      if (verifyError || !verifiedStudent) {
        throw new Error('Student not found in verified list');
      }

      // Create profile
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          role: 'student',
          htno: profileData.htno,
          student_name: profileData.student_name,
          year: profileData.year,
          status: 'pending'
        });

      if (insertError) throw insertError;

      // Update local user state
      setUser(prev => prev ? {
        ...prev,
        htno: profileData.htno,
        student_name: profileData.student_name,
        year: profileData.year,
        status: 'pending'
      } : null);
      
      setNeedsProfile(false);
    } catch (error) {
      console.error('Profile creation error:', error);
      throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setNeedsProfile(false);
    setLocation('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, needsProfile, createProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
