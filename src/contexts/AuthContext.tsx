import { useAuth } from '@/contexts/AuthContext';

function AppWrapper() {
  const { loading, userProfile, needsProfileCreation } = useAuth();

  if (loading) {
    return <div className="spinner">Loading...</div>;
  }

  if (needsProfileCreation) {
    return <ProfileCreationModal />;
  }

  if (!userProfile) {
    return <LoginScreen />;
  }

  return <MainApp userProfile={userProfile} />;
}
