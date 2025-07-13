
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
    ht_no: '',
    student_name: '',
    year: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.ht_no || !formData.student_name || !formData.year) {
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
        ht_no: formData.ht_no,
        student_name: formData.student_name,
        year: parseInt(formData.year)
      });
      
      toast({
        title: "Profile Created",
        description: "Your profile has been submitted for admin approval.",
      });
      
      // Reset form
      setFormData({ ht_no: '', student_name: '', year: '' });
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
          <DialogDescription>
            Complete your student profile to access the dashboard
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="ht_no">Hall Ticket Number (H.T No.)</Label>
            <Input
              id="ht_no"
              value={formData.ht_no}
              onChange={(e) => setFormData(prev => ({ ...prev, ht_no: e.target.value }))}
              placeholder="e.g., 2X891A72XX"
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
