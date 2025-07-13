import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { supabase } from '@/integrations/supabase/client';
import {
  Card, CardHeader, CardTitle, CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Clock, FileDown, LogOut, Upload, Eye, Trash2, User, BookOpen } from 'lucide-react';

const StudentDashboard = () => {
  const { userProfile, logout, loading } = useAuth();
  const [, setLocation] = useLocation();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);

  const [openCertModal, setOpenCertModal] = useState(false);
  const [certTitle, setCertTitle] = useState('');
  const [certDesc, setCertDesc] = useState('');
  const [certFile, setCertFile] = useState<File | null>(null);

  useEffect(() => {
    if (!loading && (!userProfile || userProfile.role !== 'student')) {
      setLocation('/');
    }
  }, [userProfile, loading]);

  useEffect(() => {
    if (userProfile?.roll_number) {
      fetchPhoto();
      fetchResults();
      fetchCertifications();
      fetchAttendance();
      fetchTimetable();
    }
  }, [userProfile]);

  const fetchPhoto = async () => {
    const { data } = await supabase.storage
      .from('profile_photos')
      .getPublicUrl(`profiles/${userProfile.id}/photo.jpg`);
    setPhotoUrl(data?.publicUrl || null);
  };

  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const path = `profiles/${userProfile.id}/photo.jpg`;
    await supabase.storage.from('profile_photos').upload(path, file, { upsert: true });
    fetchPhoto();
  };

  const getInitials = (name: string) => name?.split(' ').map((n) => n[0]).join('').toUpperCase();

  const fetchResults = async () => {
    const { data } = await supabase
      .from('results')
      .select('*')
      .eq('roll_number', userProfile.roll_number);
    setResults(data || []);
  };

  const fetchCertifications = async () => {
    const { data } = await supabase
      .from('certifications')
      .select('*')
      .eq('roll_number', userProfile.roll_number);
    setCertifications(data || []);
  };

  const fetchAttendance = async () => {
    const { data } = await supabase
      .from('attendance_summary')
      .select('*')
      .eq('roll_number', userProfile.roll_number);
    setAttendance(data || []);
  };

  const fetchTimetable = async () => {
    const { data } = await supabase
      .from('timetables')
      .select('*')
      .eq('year', userProfile.year);
    setTimetable(data || []);
  };

  const uploadCertificate = async () => {
    if (!certFile || !certTitle) return;
    const path = `certifications/${userProfile.roll_number}/${certTitle}.pdf`;
    await supabase.storage.from('certifications').upload(path, certFile, { upsert: true });
    await supabase.from('certifications').insert({
      roll_number: userProfile.roll_number,
      title: certTitle,
      description: certDesc,
      file_url: path,
    });
    setOpenCertModal(false);
    fetchCertifications();
    setCertFile(null);
    setCertTitle('');
    setCertDesc('');
  };

  const deleteCertificate = async (filePath: string, id: string) => {
    await supabase.storage.from('certifications').remove([filePath]);
    await supabase.from('certifications').delete().eq('id', id);
    fetchCertifications();
  };

  if (loading || !userProfile) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {userProfile.student_name}</h1>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://eazypay.icicibank.com/eazypayLink?P1=/2/SVNghjulFgj4uw2vsXQ=="
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline"
          >
            Pay Fees
          </a>
          <Button variant="outline" onClick={logout}>
            <LogOut className="w-4 h-4 mr-1" /> Logout
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-gray-500">Roll Number</p>
              <p className="font-semibold">{userProfile.roll_number}</p>
            </div>
            <User className="text-blue-500 w-6 h-6" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-gray-500">Academic Year</p>
              <p className="font-semibold">{userProfile.year}</p>
            </div>
            <BookOpen className="text-green-500 w-6 h-6" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-gray-500">Attendance (Cumulative)</p>
              <p className="font-semibold">
                {attendance.length > 0
                  ? `${Math.round(
                      (attendance.reduce((sum, a) => sum + a.attended, 0) /
                        attendance.reduce((sum, a) => sum + a.total, 0)) *
                        100
                    )}%`
                  : 'N/A'}
              </p>
            </div>
            <Clock className="text-orange-500 w-6 h-6" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-gray-500">Profile</p>
              <div className="flex items-center space-x-2">
                {photoUrl ? (
                  <img src={photoUrl} className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold">
                    {getInitials(userProfile.student_name)}
                  </div>
                )}
                <Upload
                  className="w-4 h-4 cursor-pointer"
                  onClick={() => profileInputRef.current?.click()}
                />
                <input
                  type="file"
                  ref={profileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleProfileUpload}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Timetable */}
      <section className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle><Calendar className="w-5 h-5 mr-2 inline" /> Timetable</CardTitle>
          </CardHeader>
          <CardContent>
            {timetable.length > 0 ? (
              <table className="w-full text-sm mt-2 border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Day</th>
                    <th className="p-2 border">Hour</th>
                    <th className="p-2 border">Subject</th>
                    <th className="p-2 border">Faculty</th>
                  </tr>
                </thead>
                <tbody>
                  {timetable.map((row, i) => (
                    <tr key={i}>
                      <td className="p-2 border">{row.day}</td>
                      <td className="p-2 border">{row.hour}</td>
                      <td className="p-2 border">{row.subject}</td>
                      <td className="p-2 border">{row.faculty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No timetable found</p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Results */}
      <section className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle><FileDown className="w-5 h-5 mr-2 inline" /> Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {results.length > 0 ? (
              results.map((res) => (
                <div key={res.id} className="flex justify-between items-center border p-2 rounded">
                  <span>{res.semester} - {new Date(res.uploaded_at).toLocaleDateString()}</span>
                  <div className="space-x-2">
                    <a href={res.file_url} target="_blank"><Eye className="w-5 h-5 text-green-600" /></a>
                    <a href={res.file_url} download><FileDown className="w-5 h-5 text-blue-600" /></a>
                  </div>
                </div>
              ))
            ) : (
              <p>📄 Results not uploaded yet.</p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Certifications */}
      <section className="mb-6">
        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle><Upload className="w-5 h-5 mr-2 inline" /> Certifications</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setOpenCertModal(true)}>Upload</Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {certifications.map((cert) => (
              <div key={cert.id} className="flex justify-between items-center border p-2 rounded">
                <div>
                  <p className="font-semibold">{cert.title}</p>
                  <p className="text-sm text-gray-600">{new Date(cert.uploaded_at).toLocaleDateString()}</p>
                </div>
                <div className="flex space-x-2">
                  <a href={`https://guseqyxrqxocgykrirsz.supabase.co/storage/v1/object/public/${cert.file_url}`} target="_blank">
                    <Eye className="w-5 h-5 text-green-600" />
                  </a>
                  <a href={`https://guseqyxrqxocgykrirsz.supabase.co/storage/v1/object/public/${cert.file_url}`} download>
                    <FileDown className="w-5 h-5 text-blue-600" />
                  </a>
                  <Trash2
                    className="w-5 h-5 text-red-600 cursor-pointer"
                    onClick={() => deleteCertificate(cert.file_url, cert.id)}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Upload Certificate Modal */}
      <Dialog open={openCertModal} onOpenChange={setOpenCertModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Upload Certificate</DialogTitle></DialogHeader>
          <Input placeholder="Title" value={certTitle} onChange={(e) => setCertTitle(e.target.value)} className="mb-2" />
          <Input placeholder="Description (optional)" value={certDesc} onChange={(e) => setCertDesc(e.target.value)} className="mb-2" />
          <Input type="file" accept=".pdf,.jpg,.png" onChange={(e) => setCertFile(e.target.files?.[0] || null)} />
          <Button className="mt-3 w-full" onClick={uploadCertificate}>Upload</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDashboard;
