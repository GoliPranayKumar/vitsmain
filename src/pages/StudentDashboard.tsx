
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, User, Calendar, BookOpen, Trophy, Clock, X } from 'lucide-react';
import { useLocation } from 'wouter';

const StudentDashboard = () => {
  const { userProfile, logout, loading } = useAuth();
  const [, setLocation] = useLocation();

  console.log('StudentDashboard: userProfile:', userProfile, 'loading:', loading);

  useEffect(() => {
    if (!loading && userProfile) {
      console.log('StudentDashboard: Checking user access', { userProfile });
      if (userProfile.role !== 'student' || userProfile.status !== 'approved') {
        console.log('User is not approved student, redirecting to home');
        setLocation('/');
        return;
      }
    }
  }, [userProfile, loading, setLocation]);

  // Show loading while checking authentication
  if (loading || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show pending approval or access denied message
  if (userProfile.role !== 'student' || userProfile.status !== 'approved') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            {userProfile.role !== 'student' ? (
              <>
                <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
                <p className="text-gray-600 mb-4">
                  You don't have student privileges to access this page.
                </p>
                <Button onClick={() => setLocation('/')} variant="outline">
                  Go Home
                </Button>
              </>
            ) : (
              <>
                <Clock className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Awaiting Approval</h2>
                <p className="text-gray-600 mb-4">
                  Your profile is currently under review by the admin. Please wait for approval to access your dashboard.
                </p>
                <Button onClick={logout} variant="outline">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {userProfile.student_name}!</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">H.T Number</p>
                  <p className="text-lg font-bold text-blue-600">{userProfile.htno || 'Not Set'}</p>
                </div>
                <User className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Academic Year</p>
                  <p className="text-lg font-bold text-green-600">{userProfile.year || 'Not Set'}</p>
                </div>
                <BookOpen className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Attendance</p>
                  <p className="text-lg font-bold text-orange-600">85%</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">CGPA</p>
                  <p className="text-lg font-bold text-purple-600">8.5</p>
                </div>
                <Trophy className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Today's Timetable</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium">Machine Learning</p>
                    <p className="text-sm text-gray-600">9:00 AM - 10:00 AM</p>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium">Data Structures</p>
                    <p className="text-sm text-gray-600">10:00 AM - 11:00 AM</p>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <div>
                    <p className="font-medium">Web Development</p>
                    <p className="text-sm text-gray-600">11:00 AM - 12:00 PM</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>Recent Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Semester 5</p>
                    <p className="text-sm text-gray-600">SGPA: 8.7</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-600 font-semibold">Passed</p>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Semester 4</p>
                    <p className="text-sm text-gray-600">SGPA: 8.3</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-600 font-semibold">Passed</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
