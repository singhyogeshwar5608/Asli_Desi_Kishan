import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../providers/auth-provider';
import { FullScreenLoader } from '../components/common/FullScreenLoader';

export const ProtectedRoute = () => {
  const { member, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <FullScreenLoader message="Authenticating..." />;
  }

  if (!member) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};
