import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';

// Generic Firestore operations
export const addDocument = async (collectionName: string, data: any) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      created_at: Timestamp.now()
    });
    return { id: docRef.id, error: null };
  } catch (error) {
    return { id: null, error };
  }
};

export const updateDocument = async (collectionName: string, docId: string, data: any) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, data);
    return { error: null };
  } catch (error) {
    return { error };
  }
};

export const deleteDocument = async (collectionName: string, docId: string) => {
  try {
    await deleteDoc(doc(db, collectionName, docId));
    return { error: null };
  } catch (error) {
    return { error };
  }
};

export const getDocument = async (collectionName: string, docId: string) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { data: { id: docSnap.id, ...docSnap.data() }, error: null };
    } else {
      return { data: null, error: 'Document not found' };
    }
  } catch (error) {
    return { data: null, error };
  }
};

export const getDocuments = async (collectionName: string, conditions?: any[]) => {
  try {
    let q = collection(db, collectionName);
    
    if (conditions && conditions.length > 0) {
      q = query(q, ...conditions);
    }
    
    const querySnapshot = await getDocs(q);
    const documents = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { data: documents, error: null };
  } catch (error) {
    return { data: [], error };
  }
};

// Real-time listener
export const subscribeToCollection = (
  collectionName: string, 
  callback: (data: any[]) => void,
  conditions?: any[]
) => {
  let q = collection(db, collectionName);
  
  if (conditions && conditions.length > 0) {
    q = query(q, ...conditions);
  }
  
  return onSnapshot(q, (querySnapshot) => {
    const documents = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(documents);
  });
};

// Specific collection operations
export const getStudentCertificates = async (htno: string) => {
  return getDocuments('student_certificates', [where('htno', '==', htno)]);
};

export const getTimetable = async (year: number) => {
  return getDocuments('timetable', [where('year', '==', year)]);
};

export const getEvents = async () => {
  return getDocuments('events', [orderBy('date', 'desc')]);
};

export const getFaculty = async () => {
  return getDocuments('faculty', [orderBy('created_at', 'desc')]);
};

export const getPlacements = async () => {
  return getDocuments('placements', [orderBy('created_at', 'desc')]);
};

export const getGallery = async () => {
  return getDocuments('gallery', [orderBy('created_at', 'desc')]);
};