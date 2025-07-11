
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, BarChart3, Award, Calendar, LogOut } from 'lucide-react';

const StudentDashboard = () => {
  const { user, logout } = useAuth();

  const studentData = {
    rollNumber: '22CS101',
    year: '2nd Year',
    section: 'A',
    semester: 4,
    status: 'approved',
    attendance: '0%',
    cgpa: 'N/A',
    certifications: 1,
    eventsRegistered: 0
  };

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
                <User className="w-8 h-8 text-green-600" />
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

        {/* Profile Details */}
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
      </main>
    </div>
  );
};

export default StudentDashboard;
