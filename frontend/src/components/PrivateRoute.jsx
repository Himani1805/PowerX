import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const PrivateRoute = ({ allowedRoles = [] }) => {
  const { user, status } = useSelector((state) => state.auth);
  const location = useLocation();

  // Handle loading state
  if (status === 'loading') {
    return <div>Loading...</div>; // Or a loading spinner
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // If authenticated and authorized, render the child routes
  return <Outlet />;
};

export default PrivateRoute;