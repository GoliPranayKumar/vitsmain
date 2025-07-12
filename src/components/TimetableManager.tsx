import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TimetableManager = () => {
  const { toast } = useToast();
  const [selectedYear, setSelectedYear] = useState('1');
  const [editingSlot, setEditingSlot] = useState(null);
  const [showAddSlot, setShowAddSlot] = useState(false);

  const timeSlots = [
    '9:00-10:00 AM',
    '10:00-11:00 AM',
    '11:00-12:00 PM',
    '12:00-1:00 PM',
    '1:00-2:00 PM',
    '2:00-3:00 PM',
    '3:00-4:00 PM',
    '4:00-5:00 PM'
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const [timetableData, setTimetableData] = useState({
    '1': {
      'Monday': {
        '9:00-10:00 AM': 'Mathematics',
        '10:00-11:00 AM': 'Physics',
        '11:00-12:00 PM': 'Programming',
        '12:00-1:00 PM': 'Lunch Break',
        '1:00-2:00 PM': 'Data Structures',
        '2:00-3:00 PM': 'Lab',
        '3:00-4:00 PM': 'Lab',
        '4:00-5:00 PM': 'Free'
      },
      'Tuesday': {
        '9:00-10:00 AM': 'Programming',
        '10:00-11:00 AM': 'Mathematics',
        '11:00-12:00 PM': 'Physics',
        '12:00-1:00 PM': 'Lunch Break',
        '1:00-2:00 PM': 'English',
        '2:00-3:00 PM': 'Data Structures',
        '3:00-4:00 PM': 'Lab',
        '4:00-5:00 PM': 'Free'
      }
      // ... other days
    },
    '2': {
      'Monday': {
        '9:00-10:00 AM': 'Machine Learning',
        '10:00-11:00 AM': 'Data Science',
        '11:00-12:00 PM': 'Statistics',
        '12:00-1:00 PM': 'Lunch Break',
        '1:00-2:00 PM': 'Python',
        '2:00-3:00 PM': 'ML Lab',
        '3:00-4:00 PM': 'ML Lab',
        '4:00-5:00 PM': 'Free'
      }
      // ... other days
    }
    // ... other years
  });

  const updateTimetableSlot = (year, day, timeSlot, subject) => {
    setTimetableData(prev => ({
      ...prev,
      [year]: {
        ...prev[year],
        [day]: {
          ...prev[year]?.[day],
          [timeSlot]: subject
        }
      }
    }));
    toast({ title: "Timetable updated successfully" });
  };

  const deleteSlot = (year, day, timeSlot) => {
    setTimetableData(prev => ({
      ...prev,
      [year]: {
        ...prev[year],
        [day]: {
          ...prev[year]?.[day],
          [timeSlot]: 'Free'
        }
      }
    }));
    toast({ title: "Time slot cleared" });
  };

  const SlotEditModal = ({ slot, onSave, onClose }) => {
    const [subject, setSubject] = useState(slot?.subject || '');

    const handleSave = () => {
      if (slot) {
        updateTimetableSlot(slot.year, slot.day, slot.timeSlot, subject);
      }
      onClose();
    };

    return (
      <Dialog open={!!slot} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit {slot?.day} - {slot?.timeSlot}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter subject name"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleSave}>Save</Button>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Timetable Management</h2>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Year 1</SelectItem>
            <SelectItem value="2">Year 2</SelectItem>
            <SelectItem value="3">Year 3</SelectItem>
            <SelectItem value="4">Year 4</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="Monday" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          {days.map(day => (
            <TabsTrigger key={day} value={day}>{day}</TabsTrigger>
          ))}
        </TabsList>

        {days.map(day => (
          <TabsContent key={day} value={day}>
            <Card>
              <CardHeader>
                <CardTitle>{day} - Year {selectedYear}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {timeSlots.map(timeSlot => {
                    const subject = timetableData[selectedYear]?.[day]?.[timeSlot] || 'Free';
                    return (
                      <div key={timeSlot} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <span className="font-medium text-sm">{timeSlot}</span>
                          <span className="ml-4 text-gray-700">{subject}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingSlot({
                              year: selectedYear,
                              day,
                              timeSlot,
                              subject
                            })}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {subject !== 'Free' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteSlot(selectedYear, day, timeSlot)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <SlotEditModal
        slot={editingSlot}
        onSave={updateTimetableSlot}
        onClose={() => setEditingSlot(null)}
      />
    </div>
  );
};

export default TimetableManager;
