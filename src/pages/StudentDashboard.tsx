import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { supabase } from '@/integrations/supabase/client';
import {
  Card, CardContent, CardHeader, CardTitle,
  Button, Tabs, TabsContent, TabsList, TabsTrigger,
  Dialog, DialogContent, DialogHeader, DialogTitle,
  Input, Label
} from '@/components/ui';
import {
  LogOut, User, Calendar, BookOpen, Upload,
  Eye, Trash2, Pencil, Trophy
} from 'lucide-react';

const StudentDashboard = () => {
  const { userProfile, logout, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<any[]>([]);
  const [openCertModal, setOpenCertModal] = useState(false);
  const [certTitle, setCertTitle] = useState('');
  const [certDesc, setCertDesc] = useState('');
  const [certFile, setCertFile] = useState<File | null>(null);
  const profileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!loading && (!userProfile || userProfile.role !== 'student')) {
      setLocation('/');
    }
  }, [userProfile, loading]);

  useEffect(() => {
    if (userProfile?.roll_number) {
      fetchProfilePhoto();
      fetchResults();
      fetchCertifications();
      fetchTimetable();
      fetchAttendance();
    }
  }, [userProfile]);

  const fetchProfilePhoto = async () => {
    const { data } = await supabase.storage.from('profile_photos').getPublicUrl(`profiles/${userProfile.id}/photo.jpg`);
    setPhotoUrl(data?.publicUrl || null);
  };

  const handleProfilePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userProfile?.id) return;
    const filePath = `profiles/${userProfile.id}/photo.jpg`;
    await supabase.storage.from('profile_photos').upload(filePath, file, { upsert: true });
    fetchProfilePhoto();
  };

  const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase();

  const fetchResults = async () => {
    const { data } = await supabase.from('results').select('*').eq('roll_number', userProfile.roll_number);
    setResults(data || []);
  };

  const fetchCertifications = async () => {
    const { data } = await supabase.from('certifications').select('*').eq('roll_number', userProfile.roll_number);
    setCertifications(data || []);
  };

  const fetchTimetable = async () => {
    const { data } = await supabase.from('timetables').select('*').eq('year', userProfile.year);
    setTimetable(data || []);
  };

  const fetchAttendance = async () => {
    const { data } = await supabase.from('attendance_summary').select('*').eq('roll_number', userProfile.roll_number);
    setAttendanceSummary(data || []);
  };

  const uploadCertificate = async () => {
    if (!certFile || !certTitle) return;
    const path = `certifications/${userProfile.roll_number}/${certTitle}.pdf`;
    const { error } = await supabase.storage.from('certifications').upload(path, certFile, { upsert: true });
    if (!error) {
      await supabase.from('certifications').insert({
        roll_number: userProfile.roll_number,
        title: certTitle,
        description: certDesc,
        file_url: path,
      });
      setOpenCertModal(false);
      fetchCertifications();
    }
  };

  const deleteCertificate = async (filePath: string, id: string) => {
    await supabase.storage.from('certifications').remove([filePath]);
    await supabase.from('certifications').delete().eq('id', id);
    fetchCertifications();
  };

  if (loading) return <div className="p-10 text-center">Loading dashboard...</div>;

  if (!userProfile || userProfile.status !== 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <Trophy className="mx-auto w-10 h-10 text-orange-500" />
            <p>Your profile is under review. Please wait for admin approval.</p>
            <Button onClick={logout}><LogOut className="w-4 h-4 mr-2" />Logout</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center text-xl font-bold">
            {photoUrl ? (
              <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span>{getInitials(userProfile.student_name)}</span>
            )}
            <input
              type="file"
              ref={profileInputRef}
              onChange={handleProfilePhotoChange}
              className="hidden"
              accept="image/*"
            />
            <button
              onClick={() => profileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow"
            >
              <Pencil className="w-4 h-4 text-black" />
            </button>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{userProfile.student_name}</h1>
            <p className="text-sm text-muted-foreground">{userProfile.roll_number}</p>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <a
            href="https://eazypay.icicibank.com/eazypayLink?P1=/2/SVNghjulFgj4uw2vsXQ=="
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="secondary">💸 Pay Fees</Button>
          </a>
          <Button variant="outline" onClick={logout}><LogOut className="w-4 h-4 mr-1" /> Logout</Button>
        </div>
      </div>

      {/* TABS */}
      <Tabs defaultValue="timetable" className="w-full">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="timetable">🗓 Timetable</TabsTrigger>
          <TabsTrigger value="certifications">🏅 Certifications</TabsTrigger>
          <TabsTrigger value="results">📄 Results</TabsTrigger>
          <TabsTrigger value="attendance">📊 Attendance</TabsTrigger>
          <TabsTrigger value="profile">👤 Profile</TabsTrigger>
        </TabsList>

        {/* ... CONTINUED in next message ... */}
        <TabsContent value="timetable">
          <Card>
            <CardHeader><CardTitle>Weekly Timetable</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              {timetable.length > 0 ? (
                <table className="w-full text-sm border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border">Day</th>
                      <th className="p-2 border">Hour</th>
                      <th className="p-2 border">Subject</th>
                      <th className="p-2 border">Faculty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timetable.map((row, idx) => (
                      <tr key={idx}>
                        <td className="p-2 border">{row.day}</td>
                        <td className="p-2 border">{row.hour}</td>
                        <td className="p-2 border">{row.subject}</td>
                        <td className="p-2 border">{row.faculty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No timetable available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certifications">
          <div className="flex justify-end mb-2">
            <Button onClick={() => setOpenCertModal(true)}><Upload className="w-4 h-4 mr-2" />Upload</Button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {certifications.length > 0 ? certifications.map((cert) => (
              <Card key={cert.id}>
                <CardHeader><CardTitle>{cert.title}</CardTitle></CardHeader>
                <CardContent className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">{cert.description || 'No description'}</p>
                    <a href={`https://guseqyxrqxocgykrirsz.supabase.co/storage/v1/object/public/${cert.file_url}`} target="_blank" className="text-blue-600 text-sm">👁 View</a>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteCertificate(cert.file_url, cert.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </CardContent>
              </Card>
            )) : <p>No certifications uploaded.</p>}
          </div>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader><CardTitle>Results</CardTitle></CardHeader>
            <CardContent>
              {results.length > 0 ? results.map((res, idx) => (
                <div key={idx} className="flex justify-between items-center border p-2 mb-2 rounded">
                  <div>
                    <p className="font-medium">{res.semester}</p>
                    <p className="text-xs text-muted-foreground">{new Date(res.uploaded_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <a href={`https://guseqyxrqxocgykrirsz.supabase.co/storage/v1/object/public/${res.file_url}`} download className="text-blue-600 text-sm">⬇ Download</a>
                    <a href={`https://guseqyxrqxocgykrirsz.supabase.co/storage/v1/object/public/${res.file_url}`} target="_blank" className="text-green-600 text-sm">👁 View</a>
                  </div>
                </div>
              )) : <p>📄 Results not uploaded yet.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader><CardTitle>Subject-wise Attendance</CardTitle></CardHeader>
            <CardContent>
              {attendanceSummary.length > 0 ? (
                <table className="w-full text-sm border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border">Subject</th>
                      <th className="p-2 border">Attended</th>
                      <th className="p-2 border">Total</th>
                      <th className="p-2 border">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceSummary.map((att, idx) => (
                      <tr key={idx}>
                        <td className="p-2 border">{att.subject}</td>
                        <td className="p-2 border">{att.attended}</td>
                        <td className="p-2 border">{att.total}</td>
                        <td className="p-2 border">{att.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No attendance data available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader><CardTitle>Profile Information</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span>Name:</span><span>{userProfile.student_name}</span></div>
              <div className="flex justify-between"><span>Roll Number:</span><span>{userProfile.roll_number}</span></div>
              <div className="flex justify-between"><span>Year:</span><span>{userProfile.year}</span></div>
              <div className="flex justify-between"><span>Email:</span><span>{userProfile.email}</span></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Certification Upload Modal */}
      <Dialog open={openCertModal} onOpenChange={setOpenCertModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Upload Certificate</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={certTitle} onChange={(e) => setCertTitle(e.target.value)} />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={certDesc} onChange={(e) => setCertDesc(e.target.value)} />
            </div>
            <div>
              <Label>Upload File (.pdf)</Label>
              <Input type="file" accept=".pdf" onChange={(e) => setCertFile(e.target.files?.[0] || null)} />
            </div>
            <Button onClick={uploadCertificate} disabled={!certTitle || !certFile}>Upload</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDashboard;
