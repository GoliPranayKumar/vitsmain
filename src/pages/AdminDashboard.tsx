
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Calendar, GraduationCap, TrendingUp, LogOut, User, BookOpen, Trophy, Image, BarChart3 } from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats] = useState({
    pendingStudents: 0,
    activeEvents: 2,
    facultyMembers: 3,
    placements: 3
  });

  const students = [
    { id: 1, name: 'John Doe', rollNumber: '22CS101', year: '2nd Year', section: 'A', status: 'approved' },
    { id: 2, name: 'Jane Smith', rollNumber: '22CS102', year: '2nd Year', section: 'A', status: 'approved' },
    { id: 3, name: 'Mike Johnson', rollNumber: '22CS103', year: '2nd Year', section: 'B', status: 'pending' },
  ];

  const events = [
    { id: 1, title: 'Machine Learning Workshop', date: '2025-07-15', status: 'upcoming', registrations: 25 },
    { id: 2, title: 'AI Conference 2025', date: '2025-07-20', status: 'active', registrations: 45 },
  ];

  const faculty = [
    { id: 1, name: 'Dr. Sarah Wilson', department: 'AI & Data Science', specialization: 'Machine Learning' },
    { id: 2, name: 'Prof. David Brown', department: 'AI & Data Science', specialization: 'Deep Learning' },
    { id: 3, name: 'Dr. Emily Davis', department: 'AI & Data Science', specialization: 'Data Analytics' },
  ];

  const placements = [
    { id: 1, student: 'Alice Cooper', company: 'Google', package: '25 LPA', year: '2024' },
    { id: 2, student: 'Bob Martin', company: 'Microsoft', package: '22 LPA', year: '2024' },
    { id: 3, student: 'Carol White', company: 'Amazon', package: '28 LPA', year: '2024' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.name}! Manage your department effectively.</p>
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
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Students</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.pendingStudents}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Events</p>
                  <p className="text-3xl font-bold text-green-600">{stats.activeEvents}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Faculty Members</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.facultyMembers}</p>
                </div>
                <GraduationCap className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Placements</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.placements}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="students" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Students</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Events</span>
            </TabsTrigger>
            <TabsTrigger value="faculty" className="flex items-center space-x-2">
              <GraduationCap className="w-4 h-4" />
              <span>Faculty</span>
            </TabsTrigger>
            <TabsTrigger value="placements" className="flex items-center space-x-2">
              <Trophy className="w-4 h-4" />
              <span>Placements</span>
            </TabsTrigger>
            <TabsTrigger value="research" className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4" />
              <span>Research</span>
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center space-x-2">
              <Image className="w-4 h-4" />
              <span>Gallery</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Student Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-2 text-left">Name</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Roll Number</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Year & Section</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Status</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id}>
                          <td className="border border-gray-200 px-4 py-2">{student.name}</td>
                          <td className="border border-gray-200 px-4 py-2">{student.rollNumber}</td>
                          <td className="border border-gray-200 px-4 py-2">{student.year} - {student.section}</td>
                          <td className="border border-gray-200 px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              student.status === 'approved' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {student.status}
                            </span>
                          </td>
                          <td className="border border-gray-200 px-4 py-2">
                            <Button size="sm" variant="outline">View Details</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Event Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{event.title}</h3>
                          <p className="text-gray-600">Date: {event.date}</p>
                          <p className="text-gray-600">Registrations: {event.registrations}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          event.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {event.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faculty">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="w-5 h-5" />
                  <span>Faculty Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {faculty.map((member) => (
                    <div key={member.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-lg">{member.name}</h3>
                      <p className="text-gray-600">{member.department}</p>
                      <p className="text-sm text-gray-500">{member.specialization}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="placements">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5" />
                  <span>Placement Records</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-2 text-left">Student</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Company</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Package</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Year</th>
                      </tr>
                    </thead>
                    <tbody>
                      {placements.map((placement) => (
                        <tr key={placement.id}>
                          <td className="border border-gray-200 px-4 py-2">{placement.student}</td>
                          <td className="border border-gray-200 px-4 py-2">{placement.company}</td>
                          <td className="border border-gray-200 px-4 py-2 font-semibold text-green-600">{placement.package}</td>
                          <td className="border border-gray-200 px-4 py-2">{placement.year}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="research">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5" />
                  <span>Research Activities</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Research management features will be available soon</p>
                  <p className="text-gray-400">Track publications, projects, and research collaborations</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gallery">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Image className="w-5 h-5" />
                  <span>Department Gallery</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Gallery management features will be available soon</p>
                  <p className="text-gray-400">Upload and manage department photos and media</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
