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
  onSubmit: (data: { ht_no: string; student_name: string; year: string }) => Promise<void>;
}

const ProfileCreationModal: React.FC<ProfileCreationModalProps> = ({
  open,
  onOpenChange,
  onSubmit,
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
      // Check if student is verified in Firebase
      console.log('Checking verification for:', { ht_no: ht_no.trim(), student_name: student_name.trim(), year: year.trim() });
      
      const verifiedStudentDoc = await getDoc(doc(db, 'verified_students', ht_no.trim()));
      
      if (!verifiedStudentDoc.exists()) {
        console.error('Student not found in verified_students');
        toast({
          title: 'Verification Failed',
          description: 'You are not listed in verified students. Please contact admin.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      const verifiedData = verifiedStudentDoc.data();
      console.log('Verification result:', { verifiedData });

      // Check if the details match
      if (verifiedData.student_name?.toLowerCase().trim() !== student_name.toLowerCase().trim() ||
          verifiedData.year?.trim() !== year.trim()) {
        console.error('Verification failed - details do not match');
        toast({
          title: 'Verification Failed',
          description: 'Your details do not match our records. Please verify your information.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      // Call the onSubmit function passed from parent
      await onSubmit({
        ht_no: ht_no.trim(),
        student_name: student_name.trim(),
        year: year.trim()
      });

      setFormData({ ht_no: '', student_name: '', year: '' });
      onOpenChange(false);
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