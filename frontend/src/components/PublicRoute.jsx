import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectIsAuthenticated, selectAuthStatus } from '../features/auth/authSlice';
import LoadingSpinner from './ui/LoadingSpinner';

export default function PublicRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authStatus = useSelector(selectAuthStatus);
  const location = useLocation();

  if (authStatus === 'loading') {
    return <LoadingSpinner fullScreen />;
  }

  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  return children;
}