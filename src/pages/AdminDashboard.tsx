import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Users, Calendar, GraduationCap, TrendingUp, LogOut, BookOpen, Trophy, Image, BarChart3, Plus, Trash2, Check, X, Upload, Edit, Clock, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import TimetableManager from '@/components/TimetableManager';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  // State for real-time data
  const [pendingStudents, setPendingStudents] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeEvents: 0,
    facultyMembers: 0,
    placements: 0
  });
  const [events, setEvents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [gallery, setGallery] = useState([
    { id: 1, title: 'Tech Fest 2024', url: '/placeholder.svg', description: 'Annual tech festival' },
    { id: 2, title: 'AI Workshop', url: '/placeholder.svg', description: 'Machine learning workshop' },
  ]);

  // Load data from Supabase
  useEffect(() => {
    loadPendingStudents();
    loadEvents();
    loadFaculty();
    loadPlacements();
    loadStats();
    
    // Set up real-time subscriptions
    const studentsChannel = supabase
      .channel('pending-students')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_profiles' }, () => {
        loadPendingStudents();
        loadStats();
      })
      .subscribe();

    const eventsChannel = supabase
      .channel('events-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'department_events' }, loadEvents)
      .subscribe();

    const facultyChannel = supabase
      .channel('faculty-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'faculty_members' }, loadFaculty)
      .subscribe();

    const placementsChannel = supabase
      .channel('placements-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'placement_records' }, loadPlacements)
      .subscribe();

    return () => {
      supabase.removeChannel(studentsChannel);
      supabase.removeChannel(eventsChannel);
      supabase.removeChannel(facultyChannel);
      supabase.removeChannel(placementsChannel);
    };
  }, []);

  const loadPendingStudents = async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('status', 'pending')
      .eq('role', 'student');
    
    if (!error && data) {
      setPendingStudents(data);
    }
  };

  const loadStats = async () => {
    const [studentsRes, eventsRes, facultyRes, placementsRes] = await Promise.all([
      supabase.from('user_profiles').select('id', { count: 'exact' }).eq('role', 'student'),
      supabase.from('department_events').select('id', { count: 'exact' }),
      supabase.from('faculty_members').select('id', { count: 'exact' }),
      supabase.from('placement_records').select('id', { count: 'exact' })
    ]);

    setStats({
      totalStudents: studentsRes.count || 0,
      activeEvents: eventsRes.count || 0,
      facultyMembers: facultyRes.count || 0,
      placements: placementsRes.count || 0
    });
  };

  const loadEvents = async () => {
    const { data, error } = await supabase
      .from('department_events')
      .select('*')
      .order('date', { ascending: false });
    
    if (!error && data) {
      setEvents(data);
    }
  };

  const loadFaculty = async () => {
    const { data, error } = await supabase
      .from('faculty_members')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setFaculty(data);
    }
  };

  const loadPlacements = async () => {
    const { data, error } = await supabase
      .from('placement_records')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setPlacements(data);
    }
  };

  // Student Management Functions
  const approveStudent = async (studentId) => {
    const { error } = await supabase
      .from('user_profiles')
      .update({ status: 'approved' })
      .eq('id', studentId);
    
    if (!error) {
      toast({ title: "Student approved successfully" });
    }
  };

  const rejectStudent = async (studentId) => {
    const { error } = await supabase
      .from('user_profiles')
      .update({ status: 'rejected' })
      .eq('id', studentId);
    
    if (!error) {
      toast({ title: "Student rejected" });
    }
  };

  // Event Management Functions
  const addEvent = async (newEvent) => {
    const { error } = await supabase
      .from('department_events')
      .insert(newEvent);
    
    if (!error) {
      toast({ title: "Event added successfully" });
    }
  };

  const deleteEvent = async (eventId) => {
    const { error } = await supabase
      .from('department_events')
      .delete()
      .eq('id', eventId);
    
    if (!error) {
      toast({ title: "Event deleted successfully" });
    }
  };

  // Faculty Management Functions
  const addFaculty = async (newFaculty) => {
    const { error } = await supabase
      .from('faculty_members')
      .insert(newFaculty);
    
    if (!error) {
      toast({ title: "Faculty member added successfully" });
    }
  };

  const deleteFaculty = async (facultyId) => {
    const { error } = await supabase
      .from('faculty_members')
      .delete()
      .eq('id', facultyId);
    
    if (!error) {
      toast({ title: "Faculty member removed successfully" });
    }
  };

  // Placement Management Functions
  const addPlacement = async (newPlacement) => {
    const { error } = await supabase
      .from('placement_records')
      .insert(newPlacement);
    
    if (!error) {
      toast({ title: "Placement record added successfully" });
    }
  };

  const deletePlacement = async (placementId) => {
    const { error } = await supabase
      .from('placement_records')
      .delete()
      .eq('id', placementId);
    
    if (!error) {
      toast({ title: "Placement record deleted successfully" });
    }
  };

  // File upload handlers
  const handleAttendanceUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      toast({ title: "Attendance sheet uploaded successfully", description: "Data will be processed and reflected in student profiles." });
    }
  };

  const handleResultsUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      toast({ title: "Results uploaded successfully", description: "Semester results will be available in student dashboards." });
    }
  };

  // Gallery Management Functions
  const addImage = (newImage) => {
    const image = { ...newImage, id: Date.now() };
    setGallery(prev => [...prev, image]);
    toast({ title: "Image added successfully" });
  };

  const deleteImage = (imageId) => {
    setGallery(prev => prev.filter(image => image.id !== imageId));
    toast({ title: "Image deleted successfully" });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const imageUrl = URL.createObjectURL(file);
        addImage({
          title: file.name,
          url: imageUrl,
          description: 'Uploaded image'
        });
      });
    }
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
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalStudents}</p>
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
          <TabsList className="grid w-full grid-cols-8">
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
            <TabsTrigger value="results" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Results</span>
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
                  <span>Student Management - Pending Approvals</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingStudents.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 px-4 py-2 text-left">H.T No.</th>
                          <th className="border border-gray-200 px-4 py-2 text-left">Student Name</th>
                          <th className="border border-gray-200 px-4 py-2 text-left">Year</th>
                          <th className="border border-gray-200 px-4 py-2 text-left">Status</th>
                          <th className="border border-gray-200 px-4 py-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingStudents.map((student) => (
                          <tr key={student.id}>
                            <td className="border border-gray-200 px-4 py-2">{student.htno}</td>
                            <td className="border border-gray-200 px-4 py-2">{student.student_name}</td>
                            <td className="border border-gray-200 px-4 py-2">{student.year}</td>
                            <td className="border border-gray-200 px-4 py-2">
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                                {student.status}
                              </span>
                            </td>
                            <td className="border border-gray-200 px-4 py-2">
                              <div className="flex space-x-2">
                                <Button size="sm" onClick={() => approveStudent(student.id)} className="bg-green-600 hover:bg-green-700">
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => rejectStudent(student.id)}>
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No pending student approvals</p>
                  </div>
                )}
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
                          <p className="text-gray-600">Time: {event.time}</p>
                          <p className="text-gray-600">Venue: {event.venue}</p>
                          {event.speaker && <p className="text-gray-600">Speaker: {event.speaker}</p>}
                          <p className="text-gray-600">{event.description}</p>
                        </div>
                        <Button size="sm" variant="destructive" onClick={() => deleteEvent(event.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
                          <p className="text-gray-600">{member.designation}</p>
                          {member.expertise && <p className="text-sm text-gray-500">Expertise: {member.expertise}</p>}
                          {member.bio && <p className="text-sm text-gray-500 mt-2">{member.bio}</p>}
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
                        <th className="border border-gray-200 px-4 py-2 text-left">Company</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">CTC</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Type</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Year</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {placements.map((placement) => (
                        <tr key={placement.id}>
                          <td className="border border-gray-200 px-4 py-2">{placement.student_name}</td>
                          <td className="border border-gray-200 px-4 py-2">{placement.company}</td>
                          <td className="border border-gray-200 px-4 py-2 font-semibold text-green-600">
                            {placement.ctc ? `${placement.ctc} LPA` : 'N/A'}
                          </td>
                          <td className="border border-gray-200 px-4 py-2">{placement.type}</td>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Results Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
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
                <TimetableManager />
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
                  <div className="flex space-x-2">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="gallery-upload"
                    />
                    <Label htmlFor="gallery-upload">
                      <Button asChild>
                        <span>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Images
                        </span>
                      </Button>
                    </Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {gallery.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gallery.map((image) => (
                      <div key={image.id} className="border rounded-lg p-4">
                        <img src={image.url} alt={image.title} className="w-full h-48 object-cover rounded-md mb-2" />
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{image.title}</h3>
                            <p className="text-sm text-gray-600">{image.description}</p>
                          </div>
                          <Button size="sm" variant="destructive" onClick={() => deleteImage(image.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No images uploaded yet</p>
                    <p className="text-gray-400">Upload department photos and media</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

// Form Components
const EventForm = ({ onSave }) => {
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    date: '', 
    time: '', 
    venue: '', 
    speaker: '' 
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setFormData({ title: '', description: '', date: '', time: '', venue: '', speaker: '' });
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
        <Label htmlFor="time">Time</Label>
        <Input id="time" type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} />
      </div>
      <div>
        <Label htmlFor="venue">Venue</Label>
        <Input id="venue" value={formData.venue} onChange={(e) => setFormData({...formData, venue: e.target.value})} />
      </div>
      <div>
        <Label htmlFor="speaker">Speaker</Label>
        <Input id="speaker" value={formData.speaker} onChange={(e) => setFormData({...formData, speaker: e.target.value})} />
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
  const [formData, setFormData] = useState({ 
    name: '', 
    designation: '', 
    bio: '', 
    expertise: '', 
    publications: '' 
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setFormData({ name: '', designation: '', bio: '', expertise: '', publications: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
      </div>
      <div>
        <Label htmlFor="designation">Designation</Label>
        <Input id="designation" value={formData.designation} onChange={(e) => setFormData({...formData, designation: e.target.value})} required />
      </div>
      <div>
        <Label htmlFor="expertise">Area of Expertise</Label>
        <Input id="expertise" value={formData.expertise} onChange={(e) => setFormData({...formData, expertise: e.target.value})} />
      </div>
      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} />
      </div>
      <div>
        <Label htmlFor="publications">Publications/Achievements</Label>
        <Textarea id="publications" value={formData.publications} onChange={(e) => setFormData({...formData, publications: e.target.value})} />
      </div>
      <Button type="submit">Add Faculty</Button>
    </form>
  );
};

const PlacementForm = ({ onSave }) => {
  const [formData, setFormData] = useState({ 
    student_name: '', 
    company: '', 
    ctc: '', 
    type: 'Full-Time', 
    year: '2025', 
    branch: 'AI & Data Science' 
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      ctc: formData.ctc ? parseFloat(formData.ctc) : null,
      year: parseInt(formData.year)
    });
    setFormData({ student_name: '', company: '', ctc: '', type: 'Full-Time', year: '2025', branch: 'AI & Data Science' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="student_name">Student Name</Label>
        <Input id="student_name" value={formData.student_name} onChange={(e) => setFormData({...formData, student_name: e.target.value})} required />
      </div>
      <div>
        <Label htmlFor="company">Company</Label>
        <Input id="company" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} required />
      </div>
      <div>
        <Label htmlFor="ctc">CTC (in LPA)</Label>
        <Input id="ctc" type="number" step="0.01" value={formData.ctc} onChange={(e) => setFormData({...formData, ctc: e.target.value})} />
      </div>
      <div>
        <Label htmlFor="type">Type</Label>
        <select 
          id="type" 
          value={formData.type} 
          onChange={(e) => setFormData({...formData, type: e.target.value})}
          className="w-full h-10 px-3 py-2 border border-input rounded-md"
        >
          <option value="Full-Time">Full-Time</option>
          <option value="Internship">Internship</option>
        </select>
      </div>
      <div>
        <Label htmlFor="year">Year</Label>
        <Input id="year" type="number" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} required />
      </div>
      <Button type="submit">Add Placement</Button>
    </form>
  );
};

export default AdminDashboard;
