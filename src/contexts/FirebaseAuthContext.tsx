import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/integrations/firebase/config';
import { signUpUser, signInUser, signOutUser, getUserProfile, UserProfile } from '@/integrations/firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  needsProfileCreation: boolean;
  login: (email: string, password: string, userType: 'student' | 'admin') => Promise<void>;
  signUp: (
    email: string,
    password: string,
    userType: 'student' | 'admin',
    htNo?: string,
    studentName?: string,
    year?: string
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

export const FirebaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [needsProfileCreation, setNeedsProfileCreation] = useState(false);
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const loadUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log('[Firebase Auth] loadUserProfile: querying for userId:', userId);
      const profile = await getUserProfile(userId);
      console.log('[Firebase Auth] loadUserProfile result:', profile);
      return profile;
    } catch (error) {
      console.error('[Firebase Auth] loadUserProfile exception:', error);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('[Firebase Auth] Auth state changed:', firebaseUser?.email || 'no user');
      if (!isMounted) return;

      setUser(firebaseUser);

      if (firebaseUser) {
        let profile = await loadUserProfile(firebaseUser.uid);
        
        // Auto-create admin profile if it doesn't exist
        if (!profile && firebaseUser.email === 'admin@vignanits.ac.in') {
          console.log('[Firebase Auth] Creating admin profile...');
          await setDoc(doc(db, 'user_profiles', firebaseUser.uid), {
            id: firebaseUser.uid,
            role: 'admin',
            status: 'approved',
            email: firebaseUser.email
          });
          
          profile = await loadUserProfile(firebaseUser.uid);
        }
        
        if (isMounted) {
          setUserProfile(profile);
          setNeedsProfileCreation(!profile && firebaseUser.email !== 'admin@vignanits.ac.in');
        }
      } else {
        if (isMounted) {
          setUserProfile(null);
          setNeedsProfileCreation(false);
        }
      }

      if (isMounted) {
        setLoading(false);
        console.log('[Firebase Auth] Auth state processing complete');
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
      console.log('[Firebase Auth] Cleaned up auth listener.');
    };
  }, []);

  const login = async (email: string, password: string, userType: 'student' | 'admin') => {
    try {
      console.log('[Firebase Auth] Login attempt:', email);
      const { user: firebaseUser, error } = await signInUser(email, password);
      if (error) throw error;

      if (firebaseUser) {
        const profile = await loadUserProfile(firebaseUser.uid);
        setUser(firebaseUser);
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
      }
    } catch (err: any) {
      toast({ title: 'Login failed', description: err.message || 'Unknown error' });
      console.error('[Firebase Auth] Login failed:', err);
      throw err;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    userType: 'student' | 'admin',
    htNo?: string,
    studentName?: string,
    year?: string
  ): Promise<{ error: any }> => {
    try {
      if (userType === 'student') {
        // Check if student is verified (you'll need to implement this check)
        // For now, we'll skip the verification check
      }

      const { user: firebaseUser, error } = await signUpUser(email, password, userType, {
        htNo,
        studentName,
        year
      });

      if (error) return { error };

      if (firebaseUser) {
        toast({
          title: 'Account created',
          description:
            userType === 'admin'
              ? 'Admin account created successfully.'
              : 'Student account created and sent for admin approval.',
        });
      }

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const createProfile = async (profileData: {
    ht_no: string;
    student_name: string;
    year: string;
  }) => {
    if (!user) throw new Error('User not authenticated for profile creation');

    await updateDoc(doc(db, 'user_profiles', user.uid), {
      ht_no: profileData.ht_no,
      student_name: profileData.student_name,
      year: profileData.year,
      status: 'pending',
    });

    const updatedProfile = await loadUserProfile(user.uid);
    setUserProfile(updatedProfile);
    setNeedsProfileCreation(false);

    toast({
      title: 'Profile submitted',
      description: 'Your profile is pending admin approval.',
    });
  };

  const closeProfileCreationModal = () => {
    setNeedsProfileCreation(false);
  };

  const logout = async () => {
    await signOutUser();
    setUser(null);
    setUserProfile(null);
    setNeedsProfileCreation(false);
    setLocation('/');
    toast({ title: 'Logged out', description: 'You have been signed out.' });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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