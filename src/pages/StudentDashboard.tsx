import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogOut, Pencil, FileDown, Eye, Trash2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { supabase } from '@/integrations/supabase/client';

const StudentDashboard = () => {
  const { userProfile, logout, loading } = useAuth();
  const [, setLocation] = useLocation();
  const profileInputRef = useRef(null);
  const [results, setResults] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [openCertModal, setOpenCertModal] = useState(false);
  const [certTitle, setCertTitle] = useState('');
  const [certDesc, setCertDesc] = useState('');
  const [certFile, setCertFile] = useState<File | null>(null);
  const [tab, setTab] = useState<'profile' | 'attendance' | 'results' | 'certifications' | 'timetable'>('profile');

  useEffect(() => {
    if (!loading && (!userProfile || userProfile.role !== 'student' || userProfile.status !== 'approved')) {
      alert('Your profile is not yet approved. Please wait for admin approval.');
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

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase();

  const fetchProfilePhoto = async () => {
    const { data } = await supabase.storage.from('profile_photos').getPublicUrl(`profiles/${userProfile.id}/photo.jpg`);
    setPhotoUrl(data?.publicUrl || null);
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
    setCertifications(data || []);
  };

  const fetchTimetable = async () => {
    const { data } = await supabase.from('timetables').select('*').eq('year', userProfile.year);
    setTimetable(data || []);
  };

  const fetchAttendance = async () => {
    const { data } = await supabase.from('attendance_summary').select('*').eq('roll_number', userProfile.roll_number);
    setAttendance(data || []);
  };

  const handleCertUpload = async () => {
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
      setCertTitle('');
      setCertDesc('');
      setCertFile(null);
      fetchCertifications();
    }
  };

  const deleteCertificate = async (filePath: string, id: string) => {
    await supabase.storage.from('certifications').remove([filePath]);
    await supabase.from('certifications').delete().eq('id', id);
    fetchCertifications();
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Student Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back, {userProfile.student_name}! Track your academic progress here.</p>
        </div>
        <Button onClick={logout} variant="outline" className="text-red-500 border-red-400">
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </div>

      {/* Top Card */}
      <div className="bg-white rounded-xl shadow p-6 mb-6 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative w-16 h-16">
            {photoUrl ? (
              <img src={photoUrl} alt="Profile" className="rounded-full w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                {getInitials(userProfile.student_name)}
              </div>
            )}
            <button
              onClick={() => profileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow hover:bg-gray-200"
            >
              <Pencil className="w-4 h-4 text-gray-700" />
            </button>
            <input
              type="file"
              accept="image/*"
              ref={profileInputRef}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadProfilePhoto(file);
              }}
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{userProfile.student_name}</h2>
            <p className="text-sm text-gray-600">Roll Number: {userProfile.roll_number}</p>
            <p className="text-sm text-gray-600">Year & Section: {userProfile.year}</p>
            <p className="text-sm text-gray-600">Semester: {userProfile.semester || '-'}</p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 text-center">
          <p className="text-sm text-gray-600">Attendance</p>
          <p className="text-2xl font-bold text-blue-600">{attendance.length ? `${attendance[0].overall}%` : '0%'}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <InfoCard title="Attendance" value={`${attendance.length ? attendance[0].overall + '%' : '0%'}`} />
        <InfoCard title="Current CGPA" value="N/A" />
        <InfoCard title="Certifications" value={certifications.length} />
        <InfoCard title="Events Registered" value="0" />
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b mb-4">
        {['profile', 'attendance', 'results', 'certifications', 'timetable'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            className={`pb-2 text-sm font-medium ${tab === t ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="bg-white rounded-xl p-6 shadow">
        {tab === 'profile' && (
          <div className="space-y-2">
            <h3 className="text-lg font-bold">👤 Student Profile</h3>
            <p><strong>Full Name:</strong> {userProfile.student_name}</p>
            <p><strong>Roll Number:</strong> {userProfile.roll_number}</p>
            <p><strong>Email:</strong> {userProfile.email}</p>
            <p><strong>Phone:</strong> {userProfile.phone || '-'}</p>
            <p><strong>Year:</strong> {userProfile.year}</p>
            <p><strong>Section:</strong> {userProfile.section || '-'}</p>
            <p><strong>Semester:</strong> {userProfile.semester || '-'}</p>
          </div>
        )}

        {tab === 'attendance' && (
          <div>
            <h3 className="text-lg font-bold mb-3">📊 Subject-wise Attendance</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="p-2 border">Subject</th>
                    <th className="p-2 border">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((a, idx) => (
                    <tr key={idx}>
                      <td className="p-2 border">{a.subject}</td>
                      <td className="p-2 border">{a.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'results' && (
          <div>
            <h3 className="text-lg font-bold mb-3">📄 Results</h3>
            {results.length === 0 ? <p>No results uploaded yet.</p> : results.map((res, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded mb-2">
                <span>{res.title || `Result ${idx + 1}`}</span>
                <div className="space-x-2">
                  <a href={res.file_url} download><FileDown className="w-5 h-5 text-blue-600" /></a>
                  <a href={res.file_url} target="_blank"><Eye className="w-5 h-5 text-green-600" /></a>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'certifications' && (
          <div>
            <h3 className="text-lg font-bold mb-3">🎓 Certifications</h3>
            <Button onClick={() => setOpenCertModal(true)} className="mb-4">Upload Certification</Button>
            {certifications.map((cert, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded mb-2">
                <div>
                  <p className="font-semibold">{cert.title}</p>
                  <p className="text-sm text-gray-600">{cert.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <a href={cert.file_url} download><FileDown className="w-5 h-5 text-blue-600" /></a>
                  <a href={cert.file_url} target="_blank"><Eye className="w-5 h-5 text-green-600" /></a>
                  <button onClick={() => deleteCertificate(cert.file_url, cert.id)}><Trash2 className="w-5 h-5 text-red-500" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'timetable' && (
          <div>
            <h3 className="text-lg font-bold mb-3">📅 Timetable</h3>
            {timetable.length === 0 ? <p>No timetable data.</p> : (
              <table className="min-w-full text-sm border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Day</th>
                    <th className="p-2 border">Subject</th>
                    <th className="p-2 border">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {timetable.map((slot, idx) => (
                    <tr key={idx}>
                      <td className="p-2 border">{slot.day}</td>
                      <td className="p-2 border">{slot.subject}</td>
                      <td className="p-2 border">{slot.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Certification Upload Modal */}
      <Dialog open={openCertModal} onOpenChange={setOpenCertModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Certification</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Title" value={certTitle} onChange={(e) => setCertTitle(e.target.value)} />
            <Input placeholder="Description" value={certDesc} onChange={(e) => setCertDesc(e.target.value)} />
            <Input type="file" onChange={(e) => setCertFile(e.target.files?.[0] || null)} />
            <Button onClick={handleCertUpload}>Upload</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const InfoCard = ({ title, value }: { title: string; value: any }) => (
  <div className="bg-white shadow rounded-xl p-4">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-xl font-bold text-blue-700">{value}</p>
  </div>
);

export default StudentDashboard;
