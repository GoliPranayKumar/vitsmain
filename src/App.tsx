
import React from 'react';
import { Route, Switch } from 'wouter';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import ProfileCreationModal from '@/components/ProfileCreationModal';
import Index from './pages/Index';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  const { needsProfile } = useAuth();

  return (
    <>
      <Switch>
        <Route path="/" component={Index} />
        <Route path="/admin-dashboard" component={AdminDashboard} />
        <Route path="/student-dashboard" component={StudentDashboard} />
        <Route component={NotFound} />
      </Switch>
      <ProfileCreationModal open={needsProfile} />
    </>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
