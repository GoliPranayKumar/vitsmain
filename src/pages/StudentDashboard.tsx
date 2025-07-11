
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, BarChart3, Award, Calendar, LogOut, BookOpen, Clock, TrendingUp } from 'lucide-react';

const StudentDashboard = () => {
  const { user, logout } = useAuth();

  const studentData = {
    rollNumber: '22CS101',
    year: '2nd Year',
    section: 'A',
    semester: 4,
    status: 'approved',
    attendance: '85%',
    cgpa: '8.5',
    certifications: 3,
    eventsRegistered: 2
  };

  const attendanceData = [
    { subject: 'Machine Learning', attendance: '90%' },
    { subject: 'Data Structures', attendance: '85%' },
    { subject: 'Database Systems', attendance: '80%' },
    { subject: 'Web Development', attendance: '88%' },
  ];

  const results = [
    { semester: 'Semester 1', gpa: '8.2', status: 'Completed' },
    { semester: 'Semester 2', gpa: '8.5', status: 'Completed' },
    { semester: 'Semester 3', gpa: '8.7', status: 'Completed' },
    { semester: 'Semester 4', gpa: '8.5', status: 'In Progress' },
  ];

  const certifications = [
    { name: 'AWS Cloud Practitioner', issuer: 'Amazon Web Services', date: '2024-06-15' },
    { name: 'Python for Data Science', issuer: 'Coursera', date: '2024-05-20' },
    { name: 'Machine Learning Basics', issuer: 'edX', date: '2024-04-10' },
  ];

  const timetable = [
    { time: '9:00 AM', monday: 'ML', tuesday: 'DS', wednesday: 'DB', thursday: 'WD', friday: 'Lab' },
    { time: '10:00 AM', monday: 'DS', tuesday: 'ML', wednesday: 'WD', thursday: 'DB', friday: 'Lab' },
    { time: '11:00 AM', monday: 'DB', tuesday: 'WD', wednesday: 'ML', thursday: 'DS', friday: 'Lab' },
    { time: '12:00 PM', monday: 'WD', tuesday: 'DB', wednesday: 'DS', thursday: 'ML', friday: 'Free' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.name}! Track your academic progress here.</p>
            </div>
            <Button
              onClick={logout}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Student Profile Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">JD</span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                  <div>
                    <span className="text-gray-600">Roll Number</span>
                    <p className="font-semibold">{studentData.rollNumber}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Year & Section</span>
                    <p className="font-semibold">{studentData.year} - {studentData.section}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Semester</span>
                    <p className="font-semibold">{studentData.semester}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Status</span>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {studentData.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Attendance</p>
                  <p className="text-3xl font-bold text-blue-600">{studentData.attendance}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current CGPA</p>
                  <p className="text-3xl font-bold text-green-600">{studentData.cgpa}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Certifications</p>
                  <p className="text-3xl font-bold text-purple-600">{studentData.certifications}</p>
                </div>
                <Award className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Events Registered</p>
                  <p className="text-3xl font-bold text-orange-600">{studentData.eventsRegistered}</p>
                </div>
                <Calendar className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Attendance</span>
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Results</span>
            </TabsTrigger>
            <TabsTrigger value="certifications" className="flex items-center space-x-2">
              <Award className="w-4 h-4" />
              <span>Certifications</span>
            </TabsTrigger>
            <TabsTrigger value="timetable" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Timetable</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Student Profile</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Full Name</h4>
                    <p className="text-gray-600">{user?.name}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Year</h4>
                    <p className="text-gray-600">{studentData.year}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Roll Number</h4>
                    <p className="text-gray-600">{studentData.rollNumber}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Section</h4>
                    <p className="text-gray-600">{studentData.section}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Email</h4>
                    <p className="text-gray-600">{user?.email}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Current Semester</h4>
                    <p className="text-gray-600">{studentData.semester}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Phone</h4>
                    <p className="text-gray-600">+91 9876543210</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Status</h4>
                    <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                      {studentData.status}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Attendance Records</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {attendanceData.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                      <span className="font-medium">{item.subject}</span>
                      <span className="text-lg font-bold text-blue-600">{item.attendance}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Academic Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-2 text-left">Semester</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">GPA</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result, index) => (
                        <tr key={index}>
                          <td className="border border-gray-200 px-4 py-2">{result.semester}</td>
                          <td className="border border-gray-200 px-4 py-2 font-bold text-green-600">{result.gpa}</td>
                          <td className="border border-gray-200 px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              result.status === 'Completed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {result.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5" />
                  <span>My Certifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {certifications.map((cert, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-lg">{cert.name}</h3>
                      <p className="text-gray-600">Issued by: {cert.issuer}</p>
                      <p className="text-sm text-gray-500">Date: {cert.date}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timetable">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Class Timetable</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-2 text-left">Time</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Monday</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Tuesday</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Wednesday</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Thursday</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Friday</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timetable.map((slot, index) => (
                        <tr key={index}>
                          <td className="border border-gray-200 px-4 py-2 font-semibold">{slot.time}</td>
                          <td className="border border-gray-200 px-4 py-2">{slot.monday}</td>
                          <td className="border border-gray-200 px-4 py-2">{slot.tuesday}</td>
                          <td className="border border-gray-200 px-4 py-2">{slot.wednesday}</td>
                          <td className="border border-gray-200 px-4 py-2">{slot.thursday}</td>
                          <td className="border border-gray-200 px-4 py-2">{slot.friday}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default StudentDashboard;
