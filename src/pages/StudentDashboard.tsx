import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'wouter';
import {
  LogOut, User, BookOpen, Clock, FileDown, Eye, Trash2, Upload,
} from 'lucide-react';
import {
  Card, CardContent, CardHeader, CardTitle,
  Button, Dialog, DialogContent, DialogHeader, DialogTitle,
  Input, Label
} from '@/components/ui';

const StudentDashboard = () => {
  const { userProfile, logout, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [results, setResults] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [subjectAttendance, setSubjectAttendance] = useState([]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const [openCertModal, setOpenCertModal] = useState(false);
  const [certTitle, setCertTitle] = useState('');
  const [certDesc, setCertDesc] = useState('');
  const [certFile, setCertFile] = useState<File | null>(null);
  const profileInputRef = useRef(null);

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

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase();

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

  const uploadProfilePhoto = async () => {
    const file = profileInputRef.current?.files?.[0];
    if (file) {
      await supabase.storage.from('profile_photos').upload(`profiles/${userProfile.id}/photo.jpg`, file, { upsert: true });
      fetchProfilePhoto();
    }
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
  };

  const deleteCertificate = async (filePath: string, id: string) => {
    await supabase.storage.from('certifications').remove([filePath]);
    await supabase.from('certifications').delete().eq('id', id);
    fetchCertifications();
  };

  if (loading) return <div className="text-center py-20">Loading Dashboard...</div>;
  if (!userProfile || userProfile.role !== 'student') return <div>Access Denied</div>;
  if (userProfile.status !== 'approved') {
    return (
      <div className="text-center py-20">
        <Clock className="w-10 h-10 mx-auto text-orange-500" />
        <h2 className="text-lg mt-2">Awaiting Approval</h2>
        <Button onClick={logout} className="mt-4">Logout</Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Profile */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {photoUrl ? (
            <img src={photoUrl} className="w-12 h-12 rounded-full" />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
              {getInitials(userProfile.student_name)}
            </div>
          )}
          <div>
            <p className="text-xl font-bold">{userProfile.student_name}</p>
            <p className="text-sm text-gray-500">Roll No: {userProfile.roll_number}</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <input type="file" ref={profileInputRef} className="hidden" onChange={uploadProfilePhoto} />
          <Button variant="outline" onClick={() => profileInputRef.current?.click()}>Upload Photo</Button>
          <Button onClick={logout}>Logout</Button>
        </div>
      </div>

      {/* Attendance */}
      <Card>
        <CardHeader><CardTitle>Subject-wise Attendance</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-left">
            <thead><tr><th>Subject</th><th>Attended</th><th>Total</th><th>%</th></tr></thead>
            <tbody>
              {subjectAttendance.map((a, i) => (
                <tr key={i}>
                  <td>{a.subject}</td>
                  <td>{a.attended}</td>
                  <td>{a.total}</td>
                  <td>{a.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Timetable */}
      <Card>
        <CardHeader><CardTitle>Weekly Timetable</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {timetable.map((t, idx) => (
            <div key={idx} className="p-2 border rounded-md">
              <strong>{t.day}</strong>: {t.subject} ({t.hour}) - {t.faculty}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader><CardTitle>Results</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {results.length === 0 ? (
            <p>📄 Results not uploaded yet.</p>
          ) : results.map((r, idx) => {
            const url = supabase.storage.from('results').getPublicUrl(`results/${userProfile.roll_number}/${r.semester}.pdf`).data.publicUrl;
            return (
              <div key={idx} className="flex justify-between border p-2 rounded-md">
                <span>{r.semester}</span>
                <div className="space-x-2">
                  <a href={url} target="_blank"><Eye className="inline w-4 h-4" /></a>
                  <a href={url} download><FileDown className="inline w-4 h-4" /></a>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Certifications</CardTitle>
          <Button onClick={() => setOpenCertModal(true)}>Upload Certificate</Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {certificates.map((c, idx) => {
            const url = supabase.storage.from('certifications').getPublicUrl(c.file_url).data.publicUrl;
            return (
              <div key={idx} className="flex justify-between items-center border p-2 rounded-md">
                <div>
                  <p className="font-medium">{c.title}</p>
                  <p className="text-sm text-gray-500">{c.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a href={url} target="_blank"><Eye className="w-4 h-4" /></a>
                  <a href={url} download><FileDown className="w-4 h-4" /></a>
                  <Button size="icon" variant="ghost" onClick={() => deleteCertificate(c.file_url, c.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Upload Modal */}
      <Dialog open={openCertModal} onOpenChange={setOpenCertModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Upload Certificate</DialogTitle></DialogHeader>
          <Label>Title</Label>
          <Input value={certTitle} onChange={e => setCertTitle(e.target.value)} />
          <Label>Description</Label>
          <Input value={certDesc} onChange={e => setCertDesc(e.target.value)} />
          <Label>File</Label>
          <Input type="file" accept='.pdf,.jpg,.jpeg,.png' onChange={e => setCertFile(e.target.files?.[0] || null)} />
          <Button className="mt-2" onClick={uploadCertificate}><Upload className="w-4 h-4 mr-1" /> Upload</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDashboard;
