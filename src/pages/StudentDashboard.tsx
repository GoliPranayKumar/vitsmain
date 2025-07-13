import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'wouter';
import {
  Card, CardContent, CardHeader, CardTitle,
  Button, Input, Label
} from '@/components/ui';
import {
  LogOut, Pencil, Upload, Eye, Trash2
} from 'lucide-react';

const StudentDashboard = () => {
  const { userProfile, logout, loading } = useAuth();
  const [, setLocation] = useLocation();

  const [activeTab, setActiveTab] = useState('profile');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [certs, setCerts] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [certFile, setCertFile] = useState<File | null>(null);
  const [certTitle, setCertTitle] = useState('');
  const [certDesc, setCertDesc] = useState('');

  useEffect(() => {
    if (!loading && (!userProfile || userProfile.role !== 'student')) {
      setLocation('/');
    }
  }, [userProfile, loading]);

  useEffect(() => {
    if (userProfile?.roll_number) {
      fetchProfilePhoto();
      fetchCerts();
      fetchResults();
      fetchTimetable();
      fetchAttendance();
    }
  }, [userProfile]);

  const getInitials = (name: string) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase();

  const fetchProfilePhoto = async () => {
    const { data } = await supabase.storage
      .from('profile_photos')
      .getPublicUrl(`profiles/${userProfile.id}/photo.jpg`);
    setPhotoUrl(data?.publicUrl || null);
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const path = `profiles/${userProfile.id}/photo.jpg`;
    await supabase.storage.from('profile_photos').upload(path, file, { upsert: true });
    fetchProfilePhoto();
  };

  const fetchCerts = async () => {
    const { data } = await supabase.from('certifications')
      .select('*').eq('roll_number', userProfile.roll_number);
    setCerts(data || []);
  };

  const fetchResults = async () => {
    const { data } = await supabase.from('results')
      .select('*').eq('roll_number', userProfile.roll_number);
    setResults(data || []);
  };

  const fetchTimetable = async () => {
    const { data } = await supabase.from('timetables')
      .select('*').eq('year', userProfile.year);
    setTimetable(data || []);
  };

  const fetchAttendance = async () => {
    const { data } = await supabase.from('attendance_summary')
      .select('*').eq('roll_number', userProfile.roll_number);
    setAttendance(data || []);
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
    fetchCerts();
    setCertTitle('');
    setCertDesc('');
    setCertFile(null);
  };

  const deleteCert = async (filePath: string, id: string) => {
    await supabase.storage.from('certifications').remove([filePath]);
    await supabase.from('certifications').delete().eq('id', id);
    fetchCerts();
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Student Dashboard</h1>
        <Button variant="outline" onClick={logout}><LogOut className="mr-2" size={16} />Logout</Button>
      </div>

      {/* Profile Top Card */}
      <div className="bg-white p-4 rounded-xl shadow flex items-center space-x-4">
        <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
          {photoUrl ? (
            <img src={photoUrl} className="w-full h-full rounded-full object-cover" />
          ) : (
            getInitials(userProfile.full_name || '')
          )}
          <Pencil size={16} className="absolute bottom-0 right-0 bg-white rounded-full p-1 cursor-pointer"
            onClick={() => fileInputRef.current?.click()} />
          <input type="file" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{userProfile.full_name}</h2>
          <p className="text-sm text-muted-foreground">{userProfile.roll_number}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><p>Attendance</p><h3 className="text-xl font-bold">{attendance.length ? `${attendance[0].cumulative}%` : '0%'}</h3></CardContent></Card>
        <Card><CardContent className="p-4"><p>Current CGPA</p><h3 className="text-xl font-bold">{userProfile.cgpa || 'N/A'}</h3></CardContent></Card>
        <Card><CardContent className="p-4"><p>Certifications</p><h3 className="text-xl font-bold">{certs.length}</h3></CardContent></Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b">
        {['profile', 'attendance', 'results', 'certs', 'timetable'].map((tab) => (
          <Button key={tab} variant={activeTab === tab ? 'default' : 'ghost'} onClick={() => setActiveTab(tab)}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</Button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <Card><CardContent className="p-6 grid grid-cols-2 gap-4">
          <p><strong>Full Name:</strong> {userProfile.full_name}</p>
          <p><strong>Email:</strong> {userProfile.email}</p>
          <p><strong>Phone:</strong> {userProfile.phone}</p>
          <p><strong>Year:</strong> {userProfile.year}</p>
          <p><strong>Section:</strong> {userProfile.section}</p>
          <p><strong>Semester:</strong> {userProfile.semester}</p>
        </CardContent></Card>
      )}

      {activeTab === 'attendance' && (
        <Card><CardContent className="p-6">
          <h3 className="font-semibold mb-4">Subject-wise Attendance</h3>
          <table className="w-full border"><thead><tr>
            <th className="p-2 border">Subject</th>
            <th className="p-2 border">Attendance %</th>
          </tr></thead><tbody>
            {attendance.map((a) => (
              <tr key={a.subject}>
                <td className="p-2 border">{a.subject}</td>
                <td className="p-2 border">{a.percentage}%</td>
              </tr>
            ))}
          </tbody></table>
        </CardContent></Card>
      )}

      {activeTab === 'results' && (
        <Card><CardContent className="p-6">
          <h3 className="font-semibold mb-4">Results</h3>
          {results.map((r) => (
            <div key={r.id} className="flex justify-between items-center mb-2">
              <span>{r.title}</span>
              <a href={supabase.storage.from('results').getPublicUrl(r.file_url).data.publicUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm"><Eye className="mr-1" size={14} /> View</Button>
              </a>
            </div>
          ))}
        </CardContent></Card>
      )}

      {activeTab === 'certs' && (
        <Card><CardContent className="p-6 space-y-4">
          <h3 className="font-semibold">Upload Certificate</h3>
          <Input type="text" placeholder="Title" value={certTitle} onChange={e => setCertTitle(e.target.value)} />
          <Input type="text" placeholder="Description" value={certDesc} onChange={e => setCertDesc(e.target.value)} />
          <Input type="file" onChange={e => setCertFile(e.target.files?.[0] || null)} />
          <Button onClick={uploadCert}><Upload size={16} className="mr-2" />Upload</Button>

          <h3 className="font-semibold mt-6">Uploaded Certificates</h3>
          {certs.map((c) => (
            <div key={c.id} className="flex justify-between items-center">
              <span>{c.title}</span>
              <div className="space-x-2">
                <a href={supabase.storage.from('certifications').getPublicUrl(c.file_url).data.publicUrl} target="_blank">
                  <Button variant="ghost" size="sm"><Eye size={14} /></Button>
                </a>
                <Button variant="destructive" size="sm" onClick={() => deleteCert(c.file_url, c.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </CardContent></Card>
      )}

      {activeTab === 'timetable' && (
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
              {timetable.map((t, idx) => (
                <tr key={idx}>
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
      )}
    </div>
  );
};

export default StudentDashboard;
