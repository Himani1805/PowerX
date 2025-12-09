import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

// Import selectors from Auth Slice
import { selectCurrentToken, selectCurrentRole } from '../features/auth/authSlice';

/**
 * @desc ProtectedRoute component checks JWT token and applies RBAC.
 * @param {object} props
 * @param {Array<string>} props.allowedRoles - Roles required to access this route (e.g., ['ADMIN', 'MANAGER'])
 * @param {React.ReactNode} [props.children] - Component to render (optional instead of Outlet)
 */
const ProtectedRoute = ({ allowedRoles = [] }) => {
  // 1. Get token and role from Redux store
  const token = useSelector(selectCurrentToken);
  const userRole = useSelector(selectCurrentRole);

  // 2. Authentication check: If token doesn't exist, redirect to login
  if (!token) {
    // Use Navigate to redirect to '/login'
    return <Navigate to="/login" replace />;
  }

  // 4. RBAC check: If token exists but user role is not in required role
  const isAuthorized = allowedRoles.includes(userRole);

  if (!isAuthorized) {
    // Show 403 Forbidden message
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-4">
        <h1 className="text-6xl font-extrabold text-red-700">403</h1>
        <p className="text-xl mt-4 text-gray-700">Access Denied</p>
        <p className="mt-2 text-lg text-red-500">
          You do not have the required role ({userRole}) to view this resource.
        </p>
        <button
          onClick={() => window.history.back()}
          className="mt-8 px-6 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  // 5. Otherwise, render children or Outlet
  // Outlet is used for nested routes
  return <Outlet />;
};

export default ProtectedRoute;