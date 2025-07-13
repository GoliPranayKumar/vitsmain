import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import {
  LogOut, Eye, Trash2, Upload, Pencil,
} from 'lucide-react';

const StudentDashboard = () => {
  const { userProfile, logout, loading } = useAuth();
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [certificates, setcertificates] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [tab, setTab] = useState('profile');

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
      fetchcertificates();
      fetchResults();
      fetchAttendance();
      fetchTimetable();
    }
  }, [userProfile]);

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
    await supabase.storage
      .from('profile_photos')
      .upload(`profiles/${userProfile.id}/photo.jpg`, file, { upsert: true });
    toast({ title: 'Photo uploaded successfully.' });
    fetchPhoto();
  };

  const fetchcertificates = async () => {
    const { data } = await supabase
      .from('certifications')
      .select('*')
      .eq('roll_number', userProfile.roll_number);
    setcertificates(data || []);
  };

  const fetchResults = async () => {
    const { data } = await supabase
      .from('results')
      .select('*')
      .eq('roll_number', userProfile.roll_number);
    setResults(data || []);
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

  const uploadCert = async () => {
    if (!certFile || !certTitle) return;
    const path = `certifications/${userProfile.roll_number}/${certTitle}.pdf`;
    await supabase.storage.from('certifications').upload(path, certFile, { upsert: true });
    await supabase.from('certifications').insert({
      roll_number: userProfile.roll_number,
      title: certTitle,
      description: certDesc,
      file_url: path,
    });
    toast({ title: 'Certificate uploaded' });
    setCertFile(null);
    setCertTitle('');
    setCertDesc('');
    fetchcertificates();
  };

  const deleteCert = async (fileUrl: string, id: string) => {
    await supabase.storage.from('certifications').remove([fileUrl]);
    await supabase.from('certifications').delete().eq('id', id);
    toast({ title: 'Certificate deleted' });
    fetchcertificates();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Student Dashboard</h1>
        <Button onClick={logout}><LogOut className="mr-2" size={16} /> Logout</Button>
      </div>

      {/* Profile Photo + Info */}
      <div className="flex items-center space-x-4">
        <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-xl">
          {photoUrl ? (
            <img src={photoUrl} className="w-full h-full rounded-full object-cover" />
          ) : (
            getInitials(userProfile.full_name || '')
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
            onChange={handlePhotoChange}
          />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{userProfile.full_name}</h2>
          <p className="text-sm text-muted-foreground">{userProfile.roll_number}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><p>Attendance</p><h3 className="text-xl font-bold">{attendance[0]?.cumulative || '0'}%</h3></CardContent></Card>
        <Card><CardContent className="p-4"><p>Current CGPA</p><h3 className="text-xl font-bold">{userProfile.cgpa || 'N/A'}</h3></CardContent></Card>
        <Card><CardContent className="p-4"><p>Certifications</p><h3 className="text-xl font-bold">{certificates.length}</h3></CardContent></Card>
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
          <Card><CardContent className="p-6 grid grid-cols-2 gap-4">
            <p><strong>Full Name:</strong> {userProfile.full_name}</p>
            <p><strong>Email:</strong> {userProfile.email}</p>
            <p><strong>Phone:</strong> {userProfile.phone}</p>
            <p><strong>Year:</strong> {userProfile.year}</p>
            <p><strong>Section:</strong> {userProfile.section}</p>
            <p><strong>Semester:</strong> {userProfile.semester}</p>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card><CardContent className="p-6">
            <h3 className="font-semibold mb-4">Subject-wise Attendance</h3>
            <table className="w-full border">
              <thead><tr>
                <th className="p-2 border">Subject</th>
                <th className="p-2 border">Attendance %</th>
              </tr></thead>
              <tbody>
                {attendance.map((a, i) => (
                  <tr key={i}>
                    <td className="p-2 border">{a.subject}</td>
                    <td className="p-2 border">{a.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="results">
          <Card><CardContent className="p-6">
            <h3 className="font-semibold mb-4">Results</h3>
            {results.map(r => (
              <div key={r.id} className="flex justify-between items-center mb-2">
                <span>{r.title}</span>
                <a href={supabase.storage.from('results').getPublicUrl(r.file_url).data.publicUrl} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm"><Eye className="mr-1" size={14} /> View</Button>
                </a>
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="certifications">
          <Card><CardContent className="p-6 space-y-4">
            <h3 className="font-semibold mb-2">Upload Certificate</h3>
            <Input placeholder="Title" value={certTitle} onChange={e => setCertTitle(e.target.value)} />
            <Input placeholder="Description" value={certDesc} onChange={e => setCertDesc(e.target.value)} />
            <Input type="file" onChange={e => setCertFile(e.target.files?.[0] || null)} />
            <Button onClick={uploadCert}><Upload size={16} className="mr-2" /> Upload</Button>

            <h3 className="font-semibold mt-6">Uploaded Certificates</h3>
            {certificates.map(c => (
              <div key={c.id} className="flex justify-between items-center">
                <span>{c.title}</span>
                <div className="space-x-2">
                  <a href={supabase.storage.from('certifications').getPublicUrl(c.file_url).data.publicUrl} target="_blank">
                    <Button size="sm" variant="ghost"><Eye size={14} /></Button>
                  </a>
                  <Button variant="destructive" size="sm" onClick={() => deleteCert(c.file_url, c.id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="timetable">
          <Card><CardContent className="p-6">
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
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentDashboard;
