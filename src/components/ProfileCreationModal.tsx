
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ProfileCreationModalProps {
  open: boolean;
}

const ProfileCreationModal: React.FC<ProfileCreationModalProps> = ({ open }) => {
  const { createProfile } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    htno: '',
    student_name: '',
    year: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.htno || !formData.student_name || !formData.year) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createProfile({
        htno: formData.htno,
        student_name: formData.student_name,
        year: parseInt(formData.year)
      });
      
      toast({
        title: "Profile Created",
        description: "Your profile has been submitted for admin approval.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create profile",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Your Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="htno">Hall Ticket Number (H.T No.)</Label>
            <Input
              id="htno"
              value={formData.htno}
              onChange={(e) => setFormData(prev => ({ ...prev, htno: e.target.value }))}
              placeholder="e.g., 22A91A05XX"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="student_name">Student Name</Label>
            <Input
              id="student_name"
              value={formData.student_name}
              onChange={(e) => setFormData(prev => ({ ...prev, student_name: e.target.value }))}
              placeholder="Your full name"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="year">Year</Label>
            <Select value={formData.year} onValueChange={(value) => setFormData(prev => ({ ...prev, year: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select your year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1st Year</SelectItem>
                <SelectItem value="2">2nd Year</SelectItem>
                <SelectItem value="3">3rd Year</SelectItem>
                <SelectItem value="4">4th Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Profile...' : 'Create Profile'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileCreationModal;
