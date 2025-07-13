/* ✅ FINAL STUDENT DASHBOARD — COMPLETE & OPTIMIZED */

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, LogOut, User, Calendar, BookOpen, Clock, FileDown, Upload, Eye, Trash2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { supabase } from '@/integrations/supabase/client';

const StudentDashboard = () => {
  const { userProfile, logout, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [results, setResults] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [subjectAttendance, setSubjectAttendance] = useState<any[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [certTitle, setCertTitle] = useState('');
  const [certDesc, setCertDesc] = useState('');
  const [certFile, setCertFile] = useState<File | null>(null);
  const [openCertModal, setOpenCertModal] = useState(false);
  const profilePicInputRef = useRef(null);

  useEffect(() => {
    if (!loading && (!userProfile || userProfile.role !== 'student')) {
      setLocation('/');
    }
  }, [userProfile, loading]);

  useEffect(() => {
    if (userProfile?.roll_number) {
      fetchAllData();
    }
  }, [userProfile]);

  const fetchAllData = async () => {
    fetchProfilePhoto();
    fetchResults();
    fetchCertifications();
    fetchTimetable();
    fetchAttendance();
  };

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase();

  const fetchProfilePhoto = async () => {
    const { data } = await supabase.storage.from('profile_photos').getPublicUrl(`profiles/${userProfile.id}/photo.jpg`);
    setPhotoUrl(data.publicUrl);
  };

  const uploadProfilePhoto = async (file: File) => {
    const path = `profiles/${userProfile.id}/photo.jpg`;
    await supabase.storage.from('profile_photos').upload(path, file, { upsert: true });
    fetchProfilePhoto();
  };

  const fetchResults = async () => {
    const { data } = await supabase.from('results').select('*').eq('roll_number', userProfile.roll_number);
    setResults(data || []);
  };

  const fetchCertifications = async () => {
    const { data } = await supabase.from('certifications').select('*').eq('roll_number', userProfile.roll_number);
    setCertificates(data || []);
  };

  const fetchTimetable = async () => {
    const { data } = await supabase.from('timetables').select('*').eq('year', userProfile.year);
    setTimetable(data || []);
  };

  const fetchAttendance = async () => {
    const { data } = await supabase.from('attendance_summary').select('*').eq('roll_number', userProfile.roll_number);
    setSubjectAttendance(data || []);
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

  if (loading) return <p>Loading...</p>;

  if (!userProfile || userProfile.status !== 'approved') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <p className="text-lg font-semibold text-gray-700">Your profile is under review by admin.</p>
        <Button onClick={() => setLocation('/')}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Student Dashboard</h1>
          <p className="text-sm text-gray-600">Welcome, {userProfile.student_name}</p>
        </div>
        <Button onClick={logout} variant="destructive">Logout</Button>
      </header>

      <Card className="mb-6">
        <CardContent className="flex items-center space-x-6 p-6">
          <div className="relative">
            {photoUrl ? (
              <img src={photoUrl} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center text-xl font-bold">
                {getInitials(userProfile.student_name)}
              </div>
            )}
            <input
              type="file"
              ref={profilePicInputRef}
              className="hidden"
              onChange={(e) => e.target.files && uploadProfilePhoto(e.target.files[0])}
            />
            <Pencil
              className="absolute bottom-0 right-0 w-5 h-5 cursor-pointer bg-white rounded-full p-1 shadow"
              onClick={() => profilePicInputRef.current?.click()}
            />
          </div>
          <div>
            <p className="text-xl font-semibold">{userProfile.student_name}</p>
            <p className="text-sm">Roll No: {userProfile.roll_number}</p>
            <p className="text-sm">Year: {userProfile.year}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <InfoCard label="Attendance" value={`${calcCumulativeAttendance(subjectAttendance)}%`} icon={<Clock />} />
        <InfoCard label="Certifications" value={certificates.length} icon={<Upload />} />
        <InfoCard label="Results Uploaded" value={results.length} icon={<FileDown />} />
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle>Subject-wise Attendance</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-left">
            <thead>
              <tr><th>Subject</th><th>Attended</th><th>Total</th><th>Percentage</th></tr>
            </thead>
            <tbody>
              {subjectAttendance.map((a, i) => (
                <tr key={i} className="border-t">
                  <td>{a.subject}</td>
                  <td>{a.attended}</td>
                  <td>{a.total}</td>
                  <td>{((a.attended / a.total) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Certifications</CardTitle>
          <Button onClick={() => setOpenCertModal(true)} size="sm">Upload</Button>
        </CardHeader>
        <CardContent>
          {certificates.map((c) => (
            <div key={c.id} className="flex justify-between items-center border p-3 rounded mb-2">
              <div>
                <p className="font-medium">{c.title}</p>
                <p className="text-sm text-gray-600">{c.description}</p>
              </div>
              <div className="flex gap-2">
                <a href={supabase.storage.from('certifications').getPublicUrl(c.file_url).data.publicUrl} target="_blank" rel="noreferrer"><Eye className="text-green-600" /></a>
                <a href={supabase.storage.from('certifications').getPublicUrl(c.file_url).data.publicUrl} download><FileDown className="text-blue-600" /></a>
                <Trash2 className="text-red-500 cursor-pointer" onClick={() => deleteCertificate(c.file_url, c.id)} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader><CardTitle>Results</CardTitle></CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <p>No results uploaded yet.</p>
          ) : (
            results.map((r, idx) => (
              <div key={idx} className="flex justify-between items-center border p-3 rounded mb-2">
                <div>
                  <p>Semester: {r.semester}</p>
                  <p className="text-sm text-gray-500">Uploaded: {new Date(r.uploaded_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <a href={supabase.storage.from('results').getPublicUrl(r.file_url).data.publicUrl} target="_blank" rel="noreferrer"><Eye className="text-green-600" /></a>
                  <a href={supabase.storage.from('results').getPublicUrl(r.file_url).data.publicUrl} download><FileDown className="text-blue-600" /></a>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Full Timetable</CardTitle></CardHeader>
        <CardContent>
          {timetable.map((slot, idx) => (
            <div key={idx} className="p-2 border-b">
              <p className="font-medium">{slot.day} - Hour {slot.hour}</p>
              <p className="text-sm text-gray-500">{slot.subject} ({slot.faculty})</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={openCertModal} onOpenChange={setOpenCertModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Upload Certificate</DialogTitle></DialogHeader>
          <Label>Title</Label>
          <Input value={certTitle} onChange={(e) => setCertTitle(e.target.value)} />
          <Label>Description</Label>
          <Input value={certDesc} onChange={(e) => setCertDesc(e.target.value)} />
          <Label>File</Label>
          <Input type="file" accept=".pdf,.jpg,.png" onChange={(e) => setCertFile(e.target.files?.[0] || null)} />
          <Button onClick={uploadCertificate} className="mt-4">Upload</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const InfoCard = ({ label, value, icon }: { label: string; value: any; icon: React.ReactNode }) => (
  <Card>
    <CardContent className="p-4 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
      {icon}
    </CardContent>
  </Card>
);

const calcCumulativeAttendance = (summary: any[]) => {
  if (!summary.length) return 0;
  const total = summary.reduce((acc, cur) => acc + cur.total, 0);
  const attended = summary.reduce((acc, cur) => acc + cur.attended, 0);
  return total === 0 ? 0 : Math.round((attended / total) * 100);
};

export default StudentDashboard;
