import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { supabase } from '@/integrations/supabase/client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  LogOut, User, Calendar, BookOpen, Trophy, Clock, FileDown, Upload, Eye, Trash2, X
} from 'lucide-react';

const StudentDashboard = () => {
  const { userProfile, logout, loading } = useAuth();
  const [, setLocation] = useLocation();

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [results, setResults] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);

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
      fetchProfilePhoto();
      fetchResults();
      fetchCertifications();
      fetchTimetable();
      fetchAttendance();
    }
  }, [userProfile]);

  const fetchProfilePhoto = async () => {
    const { data } = await supabase.storage
      .from('profile_photos')
      .getPublicUrl(`profiles/${userProfile.id}/photo.jpg`);
    if (data?.publicUrl) setPhotoUrl(data.publicUrl);
  };

  const handlePhotoUpload = async () => {
    const file = photoInputRef.current?.files?.[0];
    if (!file) return;
    const path = `profiles/${userProfile.id}/photo.jpg`;
    await supabase.storage.from('profile_photos').upload(path, file, { upsert: true });
    fetchProfilePhoto();
  };

  const getInitials = (name: string) =>
    name?.split(' ').map((n) => n[0]).join('').toUpperCase();

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
    setCertificates(data || []);
  };

  const fetchTimetable = async () => {
    const { data } = await supabase
      .from('timetables')
      .select('*')
      .eq('year', userProfile.year);
    setTimetable(data || []);
  };

  const fetchAttendance = async () => {
    const { data } = await supabase
      .from('attendance_summary')
      .select('*')
      .eq('roll_number', userProfile.roll_number);
    setAttendance(data || []);
  };

  const uploadCertificate = async () => {
    if (!certFile || !certTitle) return;
    const path = `certifications/${userProfile.roll_number}/${certTitle}.pdf`;
    const { error } = await supabase.storage
      .from('certifications')
      .upload(path, certFile, { upsert: true });

    if (!error) {
      await supabase.from('certifications').insert({
        roll_number: userProfile.roll_number,
        title: certTitle,
        description: certDesc,
        file_url: path,
      });
      setOpenCertModal(false);
      setCertFile(null);
      setCertTitle('');
      setCertDesc('');
      fetchCertifications();
    }
  };

  const deleteCertificate = async (filePath: string, id: string) => {
    await supabase.storage.from('certifications').remove([filePath]);
    await supabase.from('certifications').delete().eq('id', id);
    fetchCertifications();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!userProfile || userProfile.status !== 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <X className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Awaiting Approval</h2>
            <p className="text-gray-600 mb-4">
              Your profile is under review by the admin. Please wait for approval.
            </p>
            <Button onClick={logout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Student Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome, {userProfile.student_name}!</p>
        </div>
        <div className="flex items-center space-x-4">
          <a
            href="https://eazypay.icicibank.com/eazypayLink?P1=/2/SVNghjulFgj4uw2vsXQ=="
            target="_blank"
            className="text-sm text-blue-600 hover:underline"
          >
            Pay Fees
          </a>
          <Button onClick={logout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center justify-center p-4">
            {photoUrl ? (
              <img src={photoUrl} alt="Profile" className="rounded-full w-20 h-20" />
            ) : (
              <div className="rounded-full w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 text-white flex items-center justify-center font-bold text-2xl">
                {getInitials(userProfile.student_name)}
              </div>
            )}
            <Input
              type="file"
              ref={photoInputRef}
              className="hidden"
              onChange={handlePhotoUpload}
            />
            <Button onClick={() => photoInputRef.current?.click()} className="ml-4">
              Upload Photo
            </Button>
          </CardContent>
        </Card>
        <InfoCard label="Roll Number" value={userProfile.roll_number} icon={<User />} />
        <InfoCard label="Year" value={userProfile.year} icon={<BookOpen />} />
        <InfoCard label="Status" value={userProfile.status} icon={<Trophy />} />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" /> Attendance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">Subject</th>
                <th>Attended</th>
                <th>Total</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((a, idx) => (
                <tr key={idx} className="border-b">
                  <td className="p-2">{a.subject}</td>
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" /> Weekly Timetable
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {timetable.map((item, i) => (
            <div key={i}>
              <strong>{item.day}</strong>: {item.subject} ({item.time}) - {item.faculty}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileDown className="w-5 h-5" /> Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          {results.length > 0 ? results.map((r, idx) => (
            <div key={idx} className="flex justify-between border p-2 mb-2 rounded">
              <span>{r.semester}</span>
              <span className="flex gap-2">
                <a href={r.file_url} target="_blank"><Eye className="w-4 h-4" /></a>
                <a href={r.file_url} download><FileDown className="w-4 h-4" /></a>
              </span>
            </div>
          )) : <p>No results uploaded yet.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" /> Certifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setOpenCertModal(true)} className="mb-4">
            Upload New
          </Button>
          {certificates.map((c, i) => (
            <div key={i} className="flex justify-between border p-2 mb-2 rounded">
              <div>
                <p className="font-medium">{c.title}</p>
                <p className="text-xs text-gray-500">{c.description}</p>
              </div>
              <div className="flex gap-2">
                <a href={c.file_url} target="_blank"><Eye className="w-4 h-4" /></a>
                <a href={c.file_url} download><FileDown className="w-4 h-4" /></a>
                <button onClick={() => deleteCertificate(c.file_url, c.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Upload Certificate Modal */}
      <Dialog open={openCertModal} onOpenChange={setOpenCertModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Certificate</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={certTitle} onChange={(e) => setCertTitle(e.target.value)} />
            <Label>Description</Label>
            <Input value={certDesc} onChange={(e) => setCertDesc(e.target.value)} />
            <Label>File (.pdf)</Label>
            <Input type="file" accept="application/pdf" onChange={(e) => setCertFile(e.target.files?.[0] || null)} />
            <Button onClick={uploadCertificate}>Upload</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const InfoCard = ({ label, value, icon }: { label: string; value: any; icon: React.ReactNode }) => (
  <Card>
    <CardContent className="p-4 flex justify-between items-center">
      <div>
        <p className="text-xs text-gray-600">{label}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
      {icon}
    </CardContent>
  </Card>
);

export default StudentDashboard;
