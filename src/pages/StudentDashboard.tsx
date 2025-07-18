import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext'; // Adjust path as needed
import { useLocation } from '@/hooks/useLocation'; // Adjust path as needed
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import ProfileCompletionModal from '@/components/ProfileCompletionModal';

// Firebase imports
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';
import { auth } from '@/firebase/config'; // Assuming you have firebase config

import {
  LogOut, Eye, Trash2, Upload, Pencil, Edit, Save, X,
} from 'lucide-react';

const StudentDashboard = () => {
  const { userProfile, logout, loading } = useAuth();
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [tab, setTab] = useState('profile');

  const [certTitle, setCertTitle] = useState('');
  const [certDesc, setCertDesc] = useState('');
  const [certFile, setCertFile] = useState<File | null>(null);

  // Profile completion and editing states
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    phone: '',
    address: '',
    emergency_no: ''
  });

  // Firebase Authentication Functions
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Firestore Logic
      const db = getFirestore();
      const userRef = doc(db, 'user_profiles', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Create profile if it doesn't exist (first time Google login)
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          student_name: user.displayName, // Assuming display name from Google
          role: 'student', // Default role
          status: 'pending',
          phone: null,
          address: null,
          emergency_no: null,
          profile_photo: null,
          created_at: new Date(),
        });
      } else {
        // User profile exists, fetch it and update context if needed
        const userData = userDoc.data();
        console.log('Existing user profile:', userData);
      }
      
      console.log('Google user signed in:', user);
      toast({
        title: '✅ Google Sign-In Successful',
        description: 'You have been signed in successfully.',
      });
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      toast({
        title: 'Google Sign-In Failed',
        description: error.message || 'Failed to sign in with Google',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, userType: 'student' | 'admin', htNo?: string, studentName?: string, year?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Firestore Logic (for signup)
      const db = getFirestore();
      const userRef = doc(db, 'user_profiles', user.uid);
      
      // Create a new profile document for the signed-up user
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        role: userType, // Store the user type
        ht_no: htNo || null,
        student_name: studentName || null,
        year: year || null,
        status: userType === 'student' ? 'pending' : 'approved', // Set initial status
        phone: null,
        address: null,
        emergency_no: null,
        profile_photo: null,
        created_at: new Date(), // Add creation timestamp
      });
      
      console.log('User signed up:', user);
      toast({
        title: '✅ Sign-Up Successful',
        description: 'Your account has been created successfully.',
      });
      return { user };
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast({
        title: 'Sign-Up Failed',
        description: error.message || 'Failed to create account',
        variant: 'destructive'
      });
      return { error };
    }
  };

  const handleFirebaseLogout = async () => {
    try {
      await firebaseSignOut(auth);
      await logout(); // Also logout from your existing auth context
      toast({
        title: '✅ Logged Out',
        description: 'You have been logged out successfully.',
      });
    } catch (error: any) {
      console.error('Error logging out:', error);
      toast({
        title: 'Logout Failed',
        description: error.message || 'Failed to logout',
        variant: 'destructive'
      });
    }
  };

  // ✅ All hooks MUST be called before any early returns
  useEffect(() => {
    if (userProfile?.id) { // Trigger fetches when userProfile is available from AuthContext
      fetchPhoto();
      fetchCertificates();
      fetchResults();
      fetchAttendance();
      fetchTimetable();
      checkProfileCompletion();
    }
  }, [userProfile]);

  // Check if profile completion is needed
  const checkProfileCompletion = () => {
    if (userProfile && userProfile.role === 'student') {
      const isIncomplete = !userProfile.phone || !userProfile.address || !userProfile.emergency_no || !userProfile.profile_photo;
      if (isIncomplete) {
        setShowProfileCompletion(true);
      }
    }
  };

  // ✅ Now safe to do early returns AFTER all hooks
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!userProfile || userProfile.role !== 'student') {
    return <div className="flex justify-center items-center h-screen text-red-500">User profile not found or not a student.</div>;
  }

  const getInitials = (name: string) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase();

  const fetchPhoto = async () => {
    const { data } = await supabase.storage
      .from('profile_photos')
      .getPublicUrl(`profiles/${userProfile.id}/photo.jpg`);
    setPhotoUrl(data?.publicUrl || null);
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      await supabase.storage
        .from('profile_photos')
        .upload(`profiles/${userProfile.id}/photo.jpg`, file, { upsert: true });
      
      // Update Firebase profile photo URL
      const db = getFirestore();
      const userRef = doc(db, 'user_profiles', userProfile.uid);
      await updateDoc(userRef, {
        profile_photo: `profiles/${userProfile.id}/photo.jpg`
      });
      
      toast({ title: 'Photo uploaded successfully.' });
      fetchPhoto();
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload photo',
        variant: 'destructive'
      });
    }
  };

  const fetchCertificates = async () => {
    if (!userProfile?.ht_no) return;
    const { data } = await supabase
      .from('student_certificates')
      .select('*')
      .eq('htno', userProfile.ht_no);
    setCertificates(data || []);
  };

  const fetchResults = async () => {
    if (!userProfile?.ht_no) return;
    const { data } = await supabase
      .from('results')
      .select('*')
      .eq('ht_no', userProfile.ht_no);
    setResults(data || []);
  };

  const fetchAttendance = async () => {
    if (!userProfile?.ht_no) return;
    const { data } = await supabase
      .from('attendance')
      .select('*')
      .eq('ht_no', userProfile.ht_no);
    setAttendance(data || []);
  };

  const fetchTimetable = async () => {
    if (!userProfile?.year) return;
    const { data } = await supabase
      .from('timetable')
      .select('*')
      .eq('year', parseInt(userProfile.year || '0'));
    setTimetable(data || []);
  };

  const uploadCert = async () => {
    if (!certFile || !certTitle) {
      toast({ 
        title: 'Error', 
        description: 'Please provide both title and file',
        variant: 'destructive' 
      });
      return;
    }

    try {
      // Debug: Check authentication state thoroughly
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('🔍 Debug - Auth user:', user);
      console.log('🔍 Debug - Auth error:', authError);
      console.log('🔍 Debug - User profile:', userProfile);
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      // Debug: Test the RLS policy condition manually
      const { data: profileCheck, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, ht_no')
        .eq('ht_no', userProfile.ht_no)
        .eq('id', user.id);
      
      console.log('🔍 Debug - Profile check:', profileCheck);
      console.log('🔍 Debug - Profile error:', profileError);

      if (!profileCheck || profileCheck.length === 0) {
        throw new Error(`Profile mismatch: auth.uid=${user.id}, profile.ht_no=${userProfile.ht_no}`);
      }

      // Get the file extension from the uploaded file
      const fileExt = certFile.name.split('.').pop();
      const fileName = `${Date.now()}-${certTitle.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExt}`;
      const path = `${userProfile.ht_no}/${fileName}`;

      console.log('🔍 Debug - File path:', path);

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('certifications')
        .upload(path, certFile, { upsert: true });

      if (uploadError) {
        console.log('🔍 Debug - Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL for the file
      const publicURL = supabase.storage.from('certifications').getPublicUrl(path).data.publicUrl;
      console.log('🔍 Debug - Public URL:', publicURL);

      // Insert record to database with extensive debugging
      console.log('🔍 Debug - About to insert:', {
        htno: userProfile.ht_no,
        title: certTitle,
        description: certDesc,
        file_url: publicURL,
      });

      const { data: insertData, error: dbError } = await supabase
        .from('student_certificates')
        .insert({
          htno: userProfile.ht_no,
          title: certTitle,
          description: certDesc,
          file_url: publicURL,
        })
        .select();

      console.log('🔍 Debug - Insert result:', insertData);
      console.log('🔍 Debug - Insert error:', dbError);

      if (dbError) {
        throw dbError;
      }

      toast({ 
        title: '✅ Certificate uploaded successfully',
        description: 'Your certificate is pending admin approval.'
      });

      setCertFile(null);
      setCertTitle('');
      setCertDesc('');
      fetchCertificates();

    } catch (error: any) {
      console.error('Error uploading certificate:', error);
      toast({ 
        title: 'Upload failed', 
        description: error.message || 'Failed to upload certificate. Please try again.',
        variant: 'destructive' 
      });
    }
  };

  const deleteCert = async (fileUrl: string, id: string) => {
    try {
      // Extract path from URL for storage deletion
      const url = new URL(fileUrl);
      const pathSegments = url.pathname.split('/');
      const fileName = pathSegments[pathSegments.length - 1];
      const htno = pathSegments[pathSegments.length - 2];
      const storagePath = `${htno}/${fileName}`;
      
      await supabase.storage.from('certifications').remove([storagePath]);
      await supabase.from('student_certificates').delete().eq('id', id);
      
      toast({ title: 'Certificate deleted' });
      fetchCertificates();
    } catch (error: any) {
      console.error('Error deleting certificate:', error);
      toast({
        title: 'Delete Failed',
        description: error.message || 'Failed to delete certificate',
        variant: 'destructive'
      });
    }
  };

  // Edit profile functions
  const handleEditProfile = () => {
    setEditForm({
      phone: userProfile.phone || '',
      address: userProfile.address || '',
      emergency_no: userProfile.emergency_no || ''
    });
    setShowEditProfile(true);
  };

  const handleSaveProfile = async () => {
    try {
      // Update in Supabase
      const { error: supabaseError } = await supabase
        .from('user_profiles')
        .update({
          phone: editForm.phone,
          address: editForm.address,
          emergency_no: editForm.emergency_no
        })
        .eq('id', userProfile.id);

      if (supabaseError) throw supabaseError;

      // Update in Firebase
      const db = getFirestore();
      const userRef = doc(db, 'user_profiles', userProfile.uid);
      await updateDoc(userRef, {
        phone: editForm.phone,
        address: editForm.address,
        emergency_no: editForm.emergency_no
      });

      toast({
        title: '✅ Profile updated successfully',
        description: 'Your profile has been updated.',
      });

      setShowEditProfile(false);
      // Refresh auth context to get updated profile
      window.location.reload();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive'
      });
    }
  };

  const handleProfileCompletion = () => {
    setShowProfileCompletion(false);
    // Refresh to get updated profile
    window.location.reload();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Student Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={signInWithGoogle} variant="outline">
            Google Sign-In
          </Button>
          <Button onClick={handleFirebaseLogout}>
            <LogOut className="mr-2" size={16} /> Logout
          </Button>
        </div>
      </div>

      {/* Profile Photo + Info */}
      <div className="flex items-center space-x-4">
        <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-xl">
          {photoUrl ? (
            <img src={photoUrl} className="w-full h-full rounded-full object-cover" alt="Profile" />
          ) : (
            getInitials(userProfile.student_name || '')
          )}
          <Pencil
            size={16}
            className="absolute bottom-0 right-0 bg-white text-black rounded-full p-1 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          />
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handlePhotoChange}
          />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{userProfile.student_name}</h2>
          <p className="text-sm text-muted-foreground">{userProfile.ht_no}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p>Attendance</p>
            <h3 className="text-xl font-bold">{attendance[0]?.cumulative || '0'}%</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p>Current CGPA</p>
            <h3 className="text-xl font-bold">{userProfile.cgpa || 'N/A'}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p>Certifications</p>
            <h3 className="text-xl font-bold">{certificates.length}</h3>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="w-full grid grid-cols-5 gap-2">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="timetable">Timetable</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Profile Information</h3>
                <Button onClick={handleEditProfile} variant="outline" size="sm">
                  <Edit className="mr-2" size={16} />
                  Edit Profile
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <p><strong>Full Name:</strong> {userProfile.student_name}</p>
                <p><strong>Email:</strong> {userProfile.email}</p>
                <p><strong>Phone:</strong> {userProfile.phone || 'Not provided'}</p>
                <p><strong>Year:</strong> {userProfile.year}</p>
                <p><strong>Address:</strong> {userProfile.address || 'Not provided'}</p>
                <p><strong>Emergency Contact:</strong> {userProfile.emergency_no || 'Not provided'}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Subject-wise Attendance</h3>
              <table className="w-full border">
                <thead>
                  <tr>
                    <th className="p-2 border">Subject</th>
                    <th className="p-2 border">Attendance %</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((a, i) => (
                    <tr key={i}>
                      <td className="p-2 border">{a.subject}</td>
                      <td className="p-2 border">{a.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Results</h3>
              {results.map(r => (
                <div key={r.id} className="flex justify-between items-center mb-2">
                  <span>{r.title}</span>
                  <a href={supabase.storage.from('results').getPublicUrl(r.file_url).data.publicUrl} target="_blank" rel="noreferrer">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-1" size={14} /> View
                    </Button>
                  </a>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certifications">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold mb-2">Upload Certificate</h3>
              <Input 
                placeholder="Title" 
                value={certTitle} 
                onChange={e => setCertTitle(e.target.value)} 
              />
              <Input 
                placeholder="Description" 
                value={certDesc} 
                onChange={e => setCertDesc(e.target.value)} 
              />
              <Input 
                type="file" 
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={e => setCertFile(e.target.files?.[0] || null)} 
              />
              <Button onClick={uploadCert}>
                <Upload size={16} className="mr-2" /> Upload
              </Button>

              <h3 className="font-semibold mt-6">Uploaded Certificates</h3>
              {certificates.map(c => (
                <div key={c.id} className="flex justify-between items-center">
                  <span>{c.title}</span>
                  <div className="space-x-2">
                    <a href={c.file_url} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="ghost">
                        <Eye size={14} />
                      </Button>
                    </a>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => deleteCert(c.file_url, c.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timetable">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Full Timetable</h3>
              <table className="w-full border">
                <thead>
                  <tr>
                    <th className="p-2 border">Day</th>
                    <th className="p-2 border">Period 1</th>
                    <th className="p-2 border">Period 2</th>
                    <th className="p-2 border">Period 3</th>
                    <th className="p-2 border">Period 4</th>
                  </tr>
                </thead>
                <tbody>
                  {timetable.map((t, i) => (
                    <tr key={i}>
                      <td className="p-2 border">{t.day}</td>
                      <td className="p-2 border">{t.p1}</td>
                      <td className="p-2 border">{t.p2}</td>
                      <td className="p-2 border">{t.p3}</td>
                      <td className="p-2 border">{t.p4}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Profile Completion Modal */}
      <ProfileCompletionModal
        isOpen={showProfileCompletion}
        userProfile={userProfile}
        onComplete={handleProfileCompletion}
      />

      {/* Edit Profile Dialog */}
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your contact information and address details.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={editForm.address}
                onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter your address"
              />
            </div>

            <div>
              <Label htmlFor="edit-emergency">Emergency Contact (Parent Number)</Label>
              <Input
                id="edit-emergency"
                type="tel"
                value={editForm.emergency_no}
                onChange={(e) => setEditForm(prev => ({ ...prev, emergency_no: e.target.value }))}
                placeholder="Enter parent/emergency contact number"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveProfile} className="flex-1">
                <Save className="mr-2" size={16} />
                Save Changes
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowEditProfile(false)}
                className="flex-1"
              >
                <X className="mr-2" size={16} />
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDashboard;
