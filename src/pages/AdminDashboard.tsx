import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Users, Calendar, GraduationCap, TrendingUp, LogOut, User, BookOpen, Trophy, Image, BarChart3, Plus, Trash2, Check, X, Upload, Edit, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [stats] = useState({
    pendingStudents: 1,
    activeEvents: 2,
    facultyMembers: 3,
    placements: 3
  });

  const [students, setStudents] = useState([
    { id: 1, name: 'John Doe', rollNumber: '22CS101', year: '2nd Year', section: 'A', status: 'approved', email: 'john@example.com', phone: '9876543210' },
    { id: 2, name: 'Jane Smith', rollNumber: '22CS102', year: '2nd Year', section: 'A', status: 'approved', email: 'jane@example.com', phone: '9876543211' },
    { id: 3, name: 'Mike Johnson', rollNumber: '22CS103', year: '2nd Year', section: 'B', status: 'pending', email: 'mike@example.com', phone: '9876543212' },
  ]);

  const [events, setEvents] = useState([
    { id: 1, title: 'Machine Learning Workshop', date: '2025-07-15', status: 'upcoming', registrations: 25, description: 'Hands-on ML workshop' },
    { id: 2, title: 'AI Conference 2025', date: '2025-07-20', status: 'active', registrations: 45, description: 'Annual AI conference' },
  ]);

  const [faculty, setFaculty] = useState([
    { id: 1, name: 'Dr. Sarah Wilson', department: 'AI & Data Science', specialization: 'Machine Learning', email: 'sarah@vignanits.ac.in' },
    { id: 2, name: 'Prof. David Brown', department: 'AI & Data Science', specialization: 'Deep Learning', email: 'david@vignanits.ac.in' },
    { id: 3, name: 'Dr. Emily Davis', department: 'AI & Data Science', specialization: 'Data Analytics', email: 'emily@vignanits.ac.in' },
  ]);

  const [placements, setPlacements] = useState([
    { id: 1, student: 'Alice Cooper', company: 'Google', package: '25 LPA', year: '2024', rollNumber: '21CS101' },
    { id: 2, student: 'Bob Martin', company: 'Microsoft', package: '22 LPA', year: '2024', rollNumber: '21CS102' },
    { id: 3, student: 'Carol White', company: 'Amazon', package: '28 LPA', year: '2024', rollNumber: '21CS103' },
  ]);

  const [timetable, setTimetable] = useState([
    { id: 1, time: '9:00 AM', monday: 'ML', tuesday: 'DS', wednesday: 'DB', thursday: 'WD', friday: 'Lab' },
    { id: 2, time: '10:00 AM', monday: 'DS', tuesday: 'ML', wednesday: 'WD', thursday: 'DB', friday: 'Lab' },
    { id: 3, time: '11:00 AM', monday: 'DB', tuesday: 'WD', wednesday: 'ML', thursday: 'DS', friday: 'Lab' },
    { id: 4, time: '12:00 PM', monday: 'WD', tuesday: 'DB', wednesday: 'DS', thursday: 'ML', friday: 'Free' },
  ]);

  const [editingStudent, setEditingStudent] = useState(null);
  const [editingTimetable, setEditingTimetable] = useState(null);

  // Student Management Functions
  const approveStudent = (studentId) => {
    setStudents(prev => prev.map(student => 
      student.id === studentId ? { ...student, status: 'approved' } : student
    ));
    toast({ title: "Student approved successfully" });
  };

  const rejectStudent = (studentId) => {
    setStudents(prev => prev.map(student => 
      student.id === studentId ? { ...student, status: 'rejected' } : student
    ));
    toast({ title: "Student rejected" });
  };

  const updateStudent = (updatedStudent) => {
    setStudents(prev => prev.map(student => 
      student.id === updatedStudent.id ? updatedStudent : student
    ));
    setEditingStudent(null);
    toast({ title: "Student details updated successfully" });
  };

  // Event Management Functions
  const addEvent = (newEvent) => {
    const event = { ...newEvent, id: Date.now(), registrations: 0 };
    setEvents(prev => [...prev, event]);
    toast({ title: "Event added successfully" });
  };

  const deleteEvent = (eventId) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
    toast({ title: "Event deleted successfully" });
  };

  // Faculty Management Functions
  const addFaculty = (newFaculty) => {
    const faculty_member = { ...newFaculty, id: Date.now() };
    setFaculty(prev => [...prev, faculty_member]);
    toast({ title: "Faculty member added successfully" });
  };

  const deleteFaculty = (facultyId) => {
    setFaculty(prev => prev.filter(member => member.id !== facultyId));
    toast({ title: "Faculty member removed successfully" });
  };

  // Placement Management Functions
  const addPlacement = (newPlacement) => {
    const placement = { ...newPlacement, id: Date.now() };
    setPlacements(prev => [...prev, placement]);
    toast({ title: "Placement record added successfully" });
  };

  const deletePlacement = (placementId) => {
    setPlacements(prev => prev.filter(placement => placement.id !== placementId));
    toast({ title: "Placement record deleted successfully" });
  };

  // Attendance Upload Function
  const handleAttendanceUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      toast({ title: "Attendance sheet uploaded successfully", description: "Data will be processed and reflected in student profiles." });
    }
  };

  // Results Upload Function
  const handleResultsUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      toast({ title: "Results uploaded successfully", description: "Semester results will be available in student dashboards." });
    }
  };

  // Timetable Update Function
  const updateTimetable = (updatedSlot) => {
    setTimetable(prev => prev.map(slot => 
      slot.id === updatedSlot.id ? updatedSlot : slot
    ));
    setEditingTimetable(null);
    toast({ title: "Timetable updated successfully" });
  };

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

        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
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
            <TabsTrigger value="attendance" className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Attendance</span>
            </TabsTrigger>
            <TabsTrigger value="timetable" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Timetable</span>
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
                                : student.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {student.status}
                            </span>
                          </td>
                          <td className="border border-gray-200 px-4 py-2">
                            <div className="flex space-x-2">
                              {student.status === 'pending' && (
                                <>
                                  <Button size="sm" onClick={() => approveStudent(student.id)} className="bg-green-600 hover:bg-green-700">
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => rejectStudent(student.id)}>
                                    <X className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline" onClick={() => setEditingStudent(student)}>
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Student Details</DialogTitle>
                                  </DialogHeader>
                                  {editingStudent && (
                                    <StudentEditForm student={editingStudent} onSave={updateStudent} />
                                  )}
                                </DialogContent>
                              </Dialog>
                            </div>
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
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Event Management</span>
                  </CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Event
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Event</DialogTitle>
                      </DialogHeader>
                      <EventForm onSave={addEvent} />
                    </DialogContent>
                  </Dialog>
                </div>
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
                          <p className="text-gray-600">{event.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            event.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {event.status}
                          </span>
                          <Button size="sm" variant="destructive" onClick={() => deleteEvent(event.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
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
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center space-x-2">
                    <GraduationCap className="w-5 h-5" />
                    <span>Faculty Management</span>
                  </CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Faculty
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Faculty Member</DialogTitle>
                      </DialogHeader>
                      <FacultyForm onSave={addFaculty} />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {faculty.map((member) => (
                    <div key={member.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{member.name}</h3>
                          <p className="text-gray-600">{member.department}</p>
                          <p className="text-sm text-gray-500">{member.specialization}</p>
                          <p className="text-sm text-gray-500">{member.email}</p>
                        </div>
                        <Button size="sm" variant="destructive" onClick={() => deleteFaculty(member.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="placements">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5" />
                    <span>Placement Records</span>
                  </CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Placement
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Placement Record</DialogTitle>
                      </DialogHeader>
                      <PlacementForm onSave={addPlacement} />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-2 text-left">Student</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Roll Number</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Company</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Package</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Year</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {placements.map((placement) => (
                        <tr key={placement.id}>
                          <td className="border border-gray-200 px-4 py-2">{placement.student}</td>
                          <td className="border border-gray-200 px-4 py-2">{placement.rollNumber}</td>
                          <td className="border border-gray-200 px-4 py-2">{placement.company}</td>
                          <td className="border border-gray-200 px-4 py-2 font-semibold text-green-600">{placement.package}</td>
                          <td className="border border-gray-200 px-4 py-2">{placement.year}</td>
                          <td className="border border-gray-200 px-4 py-2">
                            <Button size="sm" variant="destructive" onClick={() => deletePlacement(placement.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Attendance Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Monthly Attendance</h3>
                      <p className="text-gray-600 mb-4">Upload Excel sheet with student roll numbers and attendance data</p>
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleAttendanceUpload}
                        className="hidden"
                        id="attendance-upload"
                      />
                      <Label htmlFor="attendance-upload">
                        <Button asChild>
                          <span>Choose File</span>
                        </Button>
                      </Label>
                    </div>
                  </div>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Semester Results</h3>
                      <p className="text-gray-600 mb-4">Upload Excel sheet with student results for each semester</p>
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleResultsUpload}
                        className="hidden"
                        id="results-upload"
                      />
                      <Label htmlFor="results-upload">
                        <Button asChild>
                          <span>Choose File</span>
                        </Button>
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timetable">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Timetable Management</span>
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
                        <th className="border border-gray-200 px-4 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timetable.map((slot) => (
                        <tr key={slot.id}>
                          <td className="border border-gray-200 px-4 py-2 font-semibold">{slot.time}</td>
                          <td className="border border-gray-200 px-4 py-2">{slot.monday}</td>
                          <td className="border border-gray-200 px-4 py-2">{slot.tuesday}</td>
                          <td className="border border-gray-200 px-4 py-2">{slot.wednesday}</td>
                          <td className="border border-gray-200 px-4 py-2">{slot.thursday}</td>
                          <td className="border border-gray-200 px-4 py-2">{slot.friday}</td>
                          <td className="border border-gray-200 px-4 py-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" onClick={() => setEditingTimetable(slot)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Timetable Slot</DialogTitle>
                                </DialogHeader>
                                {editingTimetable && (
                                  <TimetableEditForm slot={editingTimetable} onSave={updateTimetable} />
                                )}
                              </DialogContent>
                            </Dialog>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gallery">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center space-x-2">
                    <Image className="w-5 h-5" />
                    <span>Department Gallery</span>
                  </CardTitle>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Images
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No images uploaded yet</p>
                  <p className="text-gray-400">Upload department photos and media</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

// Form Components
const StudentEditForm = ({ student, onSave }) => {
  const [formData, setFormData] = useState(student);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
      </div>
      <div>
        <Label htmlFor="year">Year</Label>
        <Input id="year" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} />
      </div>
      <div>
        <Label htmlFor="section">Section</Label>
        <Input id="section" value={formData.section} onChange={(e) => setFormData({...formData, section: e.target.value})} />
      </div>
      <Button type="submit">Save Changes</Button>
    </form>
  );
};

const EventForm = ({ onSave }) => {
  const [formData, setFormData] = useState({ title: '', date: '', status: 'upcoming', description: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setFormData({ title: '', date: '', status: 'upcoming', description: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Event Title</Label>
        <Input id="title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
      </div>
      <div>
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
      </div>
      <Button type="submit">Add Event</Button>
    </form>
  );
};

const FacultyForm = ({ onSave }) => {
  const [formData, setFormData] = useState({ name: '', department: 'AI & Data Science', specialization: '', email: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setFormData({ name: '', department: 'AI & Data Science', specialization: '', email: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
      </div>
      <div>
        <Label htmlFor="specialization">Specialization</Label>
        <Input id="specialization" value={formData.specialization} onChange={(e) => setFormData({...formData, specialization: e.target.value})} required />
      </div>
      <Button type="submit">Add Faculty</Button>
    </form>
  );
};

const PlacementForm = ({ onSave }) => {
  const [formData, setFormData] = useState({ student: '', rollNumber: '', company: '', package: '', year: '2025' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setFormData({ student: '', rollNumber: '', company: '', package: '', year: '2025' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="student">Student Name</Label>
        <Input id="student" value={formData.student} onChange={(e) => setFormData({...formData, student: e.target.value})} required />
      </div>
      <div>
        <Label htmlFor="rollNumber">Roll Number</Label>
        <Input id="rollNumber" value={formData.rollNumber} onChange={(e) => setFormData({...formData, rollNumber: e.target.value})} required />
      </div>
      <div>
        <Label htmlFor="company">Company</Label>
        <Input id="company" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} required />
      </div>
      <div>
        <Label htmlFor="package">Package</Label>
        <Input id="package" value={formData.package} onChange={(e) => setFormData({...formData, package: e.target.value})} required />
      </div>
      <div>
        <Label htmlFor="year">Year</Label>
        <Input id="year" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} required />
      </div>
      <Button type="submit">Add Placement</Button>
    </form>
  );
};

const TimetableEditForm = ({ slot, onSave }) => {
  const [formData, setFormData] = useState(slot);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="monday">Monday</Label>
        <Input id="monday" value={formData.monday} onChange={(e) => setFormData({...formData, monday: e.target.value})} />
      </div>
      <div>
        <Label htmlFor="tuesday">Tuesday</Label>
        <Input id="tuesday" value={formData.tuesday} onChange={(e) => setFormData({...formData, tuesday: e.target.value})} />
      </div>
      <div>
        <Label htmlFor="wednesday">Wednesday</Label>
        <Input id="wednesday" value={formData.wednesday} onChange={(e) => setFormData({...formData, wednesday: e.target.value})} />
      </div>
      <div>
        <Label htmlFor="thursday">Thursday</Label>
        <Input id="thursday" value={formData.thursday} onChange={(e) => setFormData({...formData, thursday: e.target.value})} />
      </div>
      <div>
        <Label htmlFor="friday">Friday</Label>
        <Input id="friday" value={formData.friday} onChange={(e) => setFormData({...formData, friday: e.target.value})} />
      </div>
      <Button type="submit">Update Timetable</Button>
    </form>
  );
};

export default AdminDashboard;
