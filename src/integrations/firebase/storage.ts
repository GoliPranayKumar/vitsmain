import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  listAll
} from 'firebase/storage';
import { storage } from './config';

export const uploadFile = async (
  path: string, 
  file: File, 
  metadata?: any
): Promise<{ url: string | null; error: any }> => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return { url: downloadURL, error: null };
  } catch (error) {
    return { url: null, error };
  }
};

export const getFileURL = async (path: string): Promise<{ url: string | null; error: any }> => {
  try {
    const storageRef = ref(storage, path);
    const url = await getDownloadURL(storageRef);
    return { url, error: null };
  } catch (error) {
    return { url: null, error };
  }
};

export const deleteFile = async (path: string): Promise<{ error: any }> => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    return { error: null };
  } catch (error) {
    return { error };
  }
};

export const listFiles = async (path: string) => {
  try {
    const storageRef = ref(storage, path);
    const result = await listAll(storageRef);
    return { files: result.items, error: null };
  } catch (error) {
    return { files: [], error };
  }
};

// Specific storage operations
export const uploadProfilePhoto = async (userId: string, file: File) => {
  return uploadFile(`profile_photos/${userId}/photo.jpg`, file);
};

export const uploadCertificate = async (htno: string, fileName: string, file: File) => {
  return uploadFile(`certifications/${htno}/${fileName}`, file);
};

export const deleteCertificate = async (htno: string, fileName: string) => {
  return deleteFile(`certifications/${htno}/${fileName}`);
};