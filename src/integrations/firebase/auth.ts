import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  User,
  UserCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './config';

export interface UserProfile {
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
  cgpa?: number | null;
  photo_url?: string | null;
  address?: string | null;
  emergency_no?: string | null;
}

export const signUpUser = async (
  email: string, 
  password: string, 
  userType: 'student' | 'admin',
  additionalData?: {
    htNo?: string;
    studentName?: string;
    year?: string;
  }
): Promise<{ user: User | null; error: any }> => {
  try {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user profile in Firestore
    const profileData: Partial<UserProfile> = {
      id: user.uid,
      role: userType,
      status: userType === 'admin' ? 'approved' : 'pending',
      email: email,
    };

    if (userType === 'student' && additionalData) {
      profileData.ht_no = additionalData.htNo;
      profileData.student_name = additionalData.studentName;
      profileData.year = additionalData.year;
    }

    await setDoc(doc(db, 'user_profiles', user.uid), profileData);

    return { user, error: null };
  } catch (error) {
    return { user: null, error };
  }
};

export const signInUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error };
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error };
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'user_profiles', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};