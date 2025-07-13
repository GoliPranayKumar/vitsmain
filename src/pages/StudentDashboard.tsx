// src/pages/StudentDashboard.tsx

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'wouter';
import {
  LogOut, Pencil, Upload, Eye, Trash2
} from 'lucide-react';
import {
  Button, Card, CardContent, Input, Label, useToast
} from '@/components/ui';

const StudentDashboard = () => {
  const { userProfile, logout, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');

  const [attendance, setAttendance] = useState<any[]>([]);
  const [certs, setCerts] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
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
      fetchAttendance();
      fetchResults();
      fetchCerts();
      fetchTimetable();
    }
  }, [userProfile]);

  const getInitials = (name: string) =>
    name?.split(' ').map((n) => n[0]).join('').toUpperCase();

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
    const { error } = await supabase.storage
      .from('profile_photos')
      .upload(path, file, { upsert: true });
    if (!error) {
      toast({ title: 'Profile photo updated!' });
      fetchProfilePhoto();
    }
  };
  const fetchAttendance = async () => {
    const { data } = await supabase
      .from('attendance_summary')
      .select('*')
      .eq('roll_number', userProfile.roll_number);
    setAttendance(data || []);
  };

  const fetchResults = async () => {
    const { data } = await supabase
      .from('results')
      .select('*')
      .eq('roll_number', userProfile.roll_number);
    setResults(data || []);
  };

  const fetchCerts = async () => {
    const { data } = await supabase
      .from('certifications')
      .select('*')
      .eq('roll_number', userProfile.roll_number);
    setCerts(data || []);
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
      toast({ title: 'Certificate uploaded!' });
      fetchCerts();
      setCertFile(null);
      setCertTitle('');
      setCertDesc('');
    }
  };

  const deleteCert = async (path: string, id: string) => {
    await supabase.storage.from('certifications').remove([path]);
    await supabase.from('certifications').delete().eq('id', id);
    toast({ title: 'Certificate deleted.' });
    fetchCerts();
  };

  return (
    <div className="p-4 space-y-6">
      {/* Top: Profile */}
      <div className="flex items-center space-x-4">
        <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
          {photoUrl ? (
            <img
              src={photoUrl}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            getInitials(userProfile.full_name)
          )}
          <Pencil
            size={16}
            className="absolute bottom-0 right-0 bg-white text-black p-[2px] rounded-full cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          />
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handlePhotoChange}
          />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{userProfile.full_name}</h2>
          <p className="text-sm text-muted-foreground">{userProfile.roll_number}</p>
        </div>
        <div className="ml-auto">
          <Button variant="outline" onClick={logout}>
            <LogOut size={16} className="mr-1" />
            Logout
          </Button>
        </div>
      </div>

      {/* Mid: Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p>Attendance</p>
            <h3 className="text-xl font-bold">
              {attendance?.[0]?.cumulative || 0}%
            </h3>
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
            <h3 className="text-xl font-bold">{certs.length}</h3>
          </CardContent>
        </Card>
      </div>

      {/* Bottom: Clean Tabs */}
      <div className="flex space-x-3 border-b pb-2">
        {['profile', 'attendance', 'results', 'certs', 'timetable'].map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'default' : 'ghost'}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </div>

      {/* Tabs content: Profile Info */}
      {activeTab === 'profile' && (
        <Card>
          <CardContent className="p-6 grid grid-cols-2 gap-4">
            <p><strong>Full Name:</strong> {userProfile.full_name}</p>
            <p><strong>Email:</strong> {userProfile.email}</p>
            <p><strong>Phone:</strong> {userProfile.phone}</p>
            <p><strong>Year:</strong> {userProfile.year}</p>
            <p><strong>Section:</strong> {userProfile.section}</p>
            <p><strong>Semester:</strong> {userProfile.semester}</p>
          </CardContent>
        </Card>
      )}

      {/* Attendance tab */}
      {activeTab === 'attendance' && (
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
                {attendance.map((att) => (
                  <tr key={att.subject}>
                    <td className="p-2 border">{att.subject}</td>
                    <td className="p-2 border">{att.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
      {/* Results tab */}
      {activeTab === 'results' && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold">Results</h3>
            {results.length === 0 && <p>No results uploaded.</p>}
            {results.map((r) => (
              <div key={r.id} className="flex justify-between items-center border-b pb-2">
                <span>{r.title}</span>
                <a
                  href={supabase.storage.from('results').getPublicUrl(r.file_url).data.publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" size="sm">
                    <Eye className="mr-1" size={14} /> View
                  </Button>
                </a>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Certifications tab */}
      {activeTab === 'certs' && (
        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Upload Certification</h3>
              <Input
                type="text"
                placeholder="Certificate Title"
                value={certTitle}
                onChange={(e) => setCertTitle(e.target.value)}
              />
              <Input
                type="text"
                placeholder="Certificate Description"
                value={certDesc}
                onChange={(e) => setCertDesc(e.target.value)}
                className="mt-2"
              />
              <Input
                type="file"
                className="mt-2"
                onChange={(e) => setCertFile(e.target.files?.[0] || null)}
              />
              <Button className="mt-3" onClick={uploadCert}>
                <Upload className="mr-2" size={16} />
                Upload
              </Button>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Uploaded Certificates</h3>
              {certs.length === 0 && <p>No certificates uploaded yet.</p>}
              {certs.map((c) => (
                <div
                  key={c.id}
                  className="flex justify-between items-center border-b py-2"
                >
                  <span>{c.title}</span>
                  <div className="space-x-2">
                    <a
                      href={supabase.storage.from('certifications').getPublicUrl(c.file_url).data.publicUrl}
                      target="_blank"
                    >
                      <Button variant="ghost" size="sm">
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timetable tab */}
      {activeTab === 'timetable' && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Full Timetable</h3>
            <table className="w-full border text-sm">
              <thead>
                <tr>
                  <th className="border p-2">Day</th>
                  <th className="border p-2">Period 1</th>
                  <th className="border p-2">Period 2</th>
                  <th className="border p-2">Period 3</th>
                  <th className="border p-2">Period 4</th>
                </tr>
              </thead>
              <tbody>
                {timetable.map((t, idx) => (
                  <tr key={idx}>
                    <td className="border p-2">{t.day}</td>
                    <td className="border p-2">{t.p1}</td>
                    <td className="border p-2">{t.p2}</td>
                    <td className="border p-2">{t.p3}</td>
                    <td className="border p-2">{t.p4}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentDashboard;

