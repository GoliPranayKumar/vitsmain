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
import { Eye, EyeOff, User, Lock, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'student' | 'admin';
  onOpenCreateProfile?: () => void;
}

const LoginModal = ({ isOpen, onClose, userType, onOpenCreateProfile }: LoginModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const { login, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isSignUp) {
        if (userType !== 'admin') {
          toast({
            title: 'Students must use Create Profile',
            description: 'Please use the Create Profile button below.',
            variant: 'destructive',
          });
          return;
        }

        const result = await signUp(email, password, userType);
        if (result.error) {
          setError(result.error.message);
          return;
        }

        toast({
          title: 'Admin Account Created',
          description: 'Admin account has been created successfully.',
        });

        resetForm();
        onClose();
      } else {
        await login(email, password, userType);
        resetForm();
        onClose();
      }
    } catch (error: any) {
      setError(error.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setError('');
    setIsSignUp(false);
    setShowPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) handleClose();
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {isSignUp ? 'Create Account' : `${userType === 'admin' ? 'Admin' : 'Student'} Login`}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            {isSignUp
              ? userType === 'admin'
                ? 'Create a new admin account'
                : 'Students must use Create Profile instead.'
              : `Enter your credentials to access the ${userType} dashboard`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder={`Enter your ${userType} email`}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="Enter your password"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={isLoading}
            >
              {isLoading
                ? (isSignUp ? 'Creating Account...' : 'Signing in...')
                : (isSignUp ? 'Create Account' : 'Sign In')}
            </Button>

            {userType === 'admin' && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center gap-2 w-full"
                  disabled={isLoading}
                >
                  <UserPlus className="w-4 h-4" />
                  {isSignUp ? 'Already have an account? Sign In' : 'New Admin? Create Account'}
                </button>
              </div>
            )}

            {userType === 'student' && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onOpenCreateProfile?.();
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                  disabled={isLoading}
                >
                  New student? Create your profile
                </button>
              </div>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
