import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, User, Calendar, BookOpen, Trophy, Clock, FileDown, Upload, Eye, X } from 'lucide-react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabaseClient';

const StudentDashboard = () => {
  const { userProfile, logout, loading } = useAuth();
  const [, setLocation] = useLocation();
  const fileInputRef = useRef(null);
  const [certificates, setCertificates] = useState<string[]>([]);
  const [results, setResults] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && (!userProfile || userProfile.role !== 'student')) {
      setLocation('/');
    }
  }, [userProfile, loading, setLocation]);

  useEffect(() => {
    if (userProfile?.id) {
      fetchFiles();
    }
  }, [userProfile]);

  const fetchFiles = async () => {
    const { data: certs } = await supabase.storage.from('certifications').list(`student_${userProfile.id}`);
    const { data: res } = await supabase.storage.from('results').list(`student_${userProfile.id}`);
    if (certs) {
      const certUrls = await Promise.all(
        certs.map(async (file) => {
          const { data } = await supabase.storage.from('certifications').getPublicUrl(`student_${userProfile.id}/${file.name}`);
          return data.publicUrl;
        })
      );
      setCertificates(certUrls);
    }
    if (res) {
      const resultUrls = await Promise.all(
        res.map(async (file) => {
          const { data } = await supabase.storage.from('results').getPublicUrl(`student_${userProfile.id}/${file.name}`);
          return data.publicUrl;
        })
      );
      setResults(resultUrls);
    }
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (file && userProfile?.id) {
      const path = `student_${userProfile.id}/${file.name}`;
      const { error } = await supabase.storage.from('certifications').upload(path, file);
      if (!error) {
        fetchFiles();
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!userProfile || userProfile.role !== 'student') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">You don't have student privileges to access this page.</p>
            <Button onClick={() => setLocation('/')} variant="outline">Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (userProfile.status !== 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Clock className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Awaiting Approval</h2>
            <p className="text-gray-600 mb-4">Your profile is under review by the admin. Please wait for approval.</p>
            <Button onClick={logout} variant="outline"><LogOut className="w-4 h-4 mr-2" />Logout</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {userProfile.student_name}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="https://eazypay.icicibank.com/eazypayLink?P1=/2/SVNghjulFgj4uw2vsXQ=="
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                Pay Fees
              </a>
              <Button onClick={logout} variant="outline" className="flex items-center space-x-2">
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <InfoCard label="H.T Number" value={userProfile.ht_no} icon={<User className="w-8 h-8 text-blue-600" />} />
          <InfoCard label="Academic Year" value={userProfile.year} icon={<BookOpen className="w-8 h-8 text-green-600" />} />
          <InfoCard label="Status" value={userProfile.status} icon={<Trophy className="w-8 h-8 text-green-600" />} />
          <InfoCard label="Attendance" value="85%" icon={<Clock className="w-8 h-8 text-orange-600" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2"><Calendar className="w-5 h-5" /><span>Today's Timetable</span></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <TimeSlot subject="Machine Learning" time="9:00 AM - 10:00 AM" color="blue" />
                <TimeSlot subject="Data Structures" time="10:00 AM - 11:00 AM" color="green" />
                <TimeSlot subject="Web Development" time="11:00 AM - 12:00 PM" color="purple" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2"><BookOpen className="w-5 h-5" /><span>Profile Info</span></CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileItem label="Name" value={userProfile.student_name} />
              <ProfileItem label="Hall Ticket" value={userProfile.ht_no} />
              <ProfileItem label="Year" value={userProfile.year} />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2"><FileDown className="w-5 h-5" /><span>Results</span></CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {results.length > 0 ? results.map((url, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Result {idx + 1}</span>
                  <div className="space-x-2">
                    <a href={url} download className="text-blue-600"><FileDown className="w-5 h-5" /></a>
                    <a href={url} target="_blank" className="text-green-600"><Eye className="w-5 h-5" /></a>
                  </div>
                </div>
              )) : <p className="text-gray-600">No results uploaded yet.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2"><Upload className="w-5 h-5" /><span>Certifications</span></CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleUpload}
              />
              <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                Upload Certificate
              </Button>
              {certificates.map((url, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Certificate {idx + 1}</span>
                  <div className="space-x-2">
                    <a href={url} download className="text-blue-600"><FileDown className="w-5 h-5" /></a>
                    <a href={url} target="_blank" className="text-green-600"><Eye className="w-5 h-5" /></a>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

const InfoCard = ({ label, value, icon }: { label: string; value: any; icon: React.ReactNode }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-lg font-bold text-gray-900">{value || 'Not Set'}</p>
        </div>
        {icon}
      </div>
    </CardContent>
  </Card>
);

const ProfileItem = ({ label, value }: { label: string; value: string | null }) => (
  <div className="flex justify-between items-center p-3 border rounded-lg">
    <div>
      <p className="font-medium">{label}</p>
      <p className="text-sm text-gray-600">{value}</p>
    </div>
  </div>
);

const TimeSlot = ({ subject, time, color }: { subject: string; time: string; color: string }) => (
  <div className={`flex justify-between items-center p-3 bg-${color}-50 rounded-lg`}>
    <div>
      <p className="font-medium">{subject}</p>
      <p className="text-sm text-gray-600">{time}</p>
    </div>
  </div>
);

export default StudentDashboard;
