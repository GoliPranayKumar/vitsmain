
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Calendar, BookOpen } from 'lucide-react';

interface AddSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (slotData: {
    year: string;
    day: string;
    startTime: string;
    endTime: string;
    subject: string;
  }) => void;
  selectedDay?: string;
  selectedYear?: string;
}

const AddSlotModal = ({ isOpen, onClose, onSave, selectedDay, selectedYear }: AddSlotModalProps) => {
  const [formData, setFormData] = useState({
    year: selectedYear || '1',
    day: selectedDay || 'Monday',
    startTime: '',
    endTime: '',
    subject: ''
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const years = ['1', '2', '3', '4'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.startTime || !formData.endTime || !formData.subject) {
      return;
    }

    onSave(formData);
    
    // Reset form
    setFormData({
      year: selectedYear || '1',
      day: selectedDay || 'Monday',
      startTime: '',
      endTime: '',
      subject: ''
    });
    
    onClose();
  };

  const handleClose = () => {
    setFormData({
      year: selectedYear || '1',
      day: selectedDay || 'Monday',
      startTime: '',
      endTime: '',
      subject: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Add New Time Slot
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="year">Year</Label>
              <Select value={formData.year} onValueChange={(value) => setFormData({...formData, year: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year}>Year {year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="day">Day</Label>
              <Select value={formData.day} onValueChange={(value) => setFormData({...formData, day: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Day" />
                </SelectTrigger>
                <SelectContent>
                  {days.map(day => (
                    <SelectItem key={day} value={day}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Start Time
              </Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="endTime" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                End Time
              </Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="subject" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Subject Name
            </Label>
            <Input
              id="subject"
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              placeholder="Enter subject name"
              required
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="submit" className="flex-1">
              Add Slot
            </Button>
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSlotModal;
