import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/integrations/firebase/config';
import { useToast } from '@/hooks/use-toast';

interface ProfileCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProfileCreationModal: React.FC<ProfileCreationModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    ht_no: '',
    student_name: '',
    year: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { ht_no, student_name, year } = formData;

    if (!ht_no || !student_name || !year) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Check if in verified_students with case-insensitive and trimmed comparison
      console.log('Checking verification for:', { ht_no: ht_no.trim(), student_name: student_name.trim(), year: year.trim() });
      
      // For Firebase, you'll need to implement your own verification logic
      // This is a placeholder - implement according to your verification system
      const verified = true; // Replace with actual verification logic

      console.log('Verification result:', { verified });

      if (!verified) {
        console.error('Verification failed');
        toast({
          title: 'Verification Failed',
          description: 'You are not listed in verified students.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      // Use the createProfile function from auth context
      // This will be handled by the parent component

      toast({
        title: 'Profile Submitted',
        description: 'Your profile is pending admin approval.',
      });

      setFormData({ ht_no: '', student_name: '', year: '' });
      onOpenChange(false); // close modal
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Your Profile</DialogTitle>
          <DialogDescription>
            Please verify yourself using official details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="ht_no">Hall Ticket Number (HT No.)</Label>
            <Input
              id="ht_no"
              name="ht_no"
              value={formData.ht_no}
              onChange={(e) => setFormData((prev) => ({ ...prev, ht_no: e.target.value }))}
              placeholder="e.g., 2X891A72XX"
              required
              autoComplete="off"
            />
          </div>

          <div>
            <Label htmlFor="student_name">Student Name</Label>
            <Input
              id="student_name"
              name="student_name"
              value={formData.student_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, student_name: e.target.value }))}
              placeholder="Your full name"
              required
              autoComplete="name"
            />
          </div>

          <div>
            <Label htmlFor="year">Year</Label>
            <Select
              value={formData.year}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, year: value }))}
            >
              <SelectTrigger id="year" aria-label="Select Year">
                <SelectValue placeholder="Select your year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1st Year">1st Year</SelectItem>
                <SelectItem value="2nd Year">2nd Year</SelectItem>
                <SelectItem value="3rd Year">3rd Year</SelectItem>
                <SelectItem value="4th Year">4th Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Profile'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileCreationModal;
