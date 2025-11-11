import { useEffect, Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCurrentUser, logout } from './features/auth/authThunks';
import { ThemeProvider } from './components/ThemeProvider';
import { TooltipProvider } from './components/ui/Tooltip';

// Lazy load components for better performance
const DashboardLayout = lazy(() => import('./components/layout/DashboardLayout'));
const PrivateRoute = lazy(() => import('./components/PrivateRoute'));

// Auth Pages
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

// Dashboard Pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const LeadsList = lazy(() => import('./pages/leads/LeadsList'));
const LeadForm = lazy(() => import('./pages/leads/LeadForm'));
const LeadDetail = lazy(() => import('./pages/leads/LeadDetail'));
const LeadSingleView = lazy(() => import('./pages/LeadSingleView'));
const Activity = lazy(() => import('./pages/Activity'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
  </div>
);

// Custom hook to handle protected routes
const useAuth = () => {
  const { user, status } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, user]);
  
  return { user, status, isAuthenticated: !!user };
};

// App wrapper to handle auth state and routing
const AppContent = () => {
  const location = useLocation();
  const { user, status, isAuthenticated } = useAuth();
  const dispatch = useDispatch();
  
  // Auto-logout on 401 errors
  useEffect(() => {
    const handleUnauthorized = () => {
      if (location.pathname !== '/login') {
        dispatch(logout());
      }
    };
    
    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, [dispatch, location]);
  
  // Show loading state while checking auth
  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
      
      <Routes>
        {/* Public Routes */}
          <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace state={{ from: location }} />
            ) : (
              <Navigate to="/login" replace state={{ from: location }} />
            )
          }
        />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace state={{ from: location }} />
            ) : (
              <Login />
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Register />
            )
          }
        />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Routes */}
        <Route
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />

          {/* Lead Routes */}
          <Route path="leads">
            <Route index element={<LeadsList />} />
            <Route path="new" element={<LeadForm />} />
            <Route path=":id" element={<LeadDetail />} />
            <Route path=":id/edit" element={<LeadForm editMode />} />
            {/* <Route path=":leadId/activities" element={<LeadSingleView />} /> */}
          </Route>

          {/* Activity Routes */}
          
           <Route path="activities" element={<Activity />} />
          {/* User Routes */}
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          
          {/* Analytics */}
          <Route path="analytics" element={<Analytics />} />
          
          {/* Admin Routes - Protected by role */}
          {user?.role === 'ADMIN' && (
            <Route path="admin/*" element={<AdminPanel />} />
          )}
          
          {/* 404 - Not Found */}
          <Route path="*" element={<NotFound />} />
        </Route>
        
        {/* Fallback to home if no route matches */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

// Main App component with providers
function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="PowerX -theme">
      <TooltipProvider>
        <AppContent />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;