import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { io } from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages & Components
// import LoginPage from './pages/LoginPage.jsx';
// import RegisterPage from './pages/RegisterPage.jsx';
// import DashboardPage from './pages/DashboardPage.jsx';
// import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
// import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
// import LeadsPage from './pages/LeadsPage.jsx';
// import ActivitiesPage from './pages/ActivitiesPage.jsx';
// import AnalyticsPage from './pages/AnalyticsPage.jsx';
// import SettingsPage from './pages/SettingsPage.jsx';
// import CreateLeadPage from './pages/CreateLeadPage.jsx';
// import ViewLeadPage from './pages/ViewLeadPage.jsx';
// import EditLeadPage from './pages/EditLeadPage.jsx';
// import ProtectedRoute from './components/ProtectedRoute.jsx';
// import Layout from './components/Layout.jsx';

// Lazy Load Pages to reduce initial bundle size
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx'));
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const LeadsPage = lazy(() => import('./pages/LeadsPage.jsx'));
const CreateLeadPage = lazy(() => import('./pages/CreateLeadPage.jsx'));
const EditLeadPage = lazy(() => import('./pages/EditLeadPage.jsx'));
const ViewLeadPage = lazy(() => import('./pages/ViewLeadPage.jsx'));
const ActivitiesPage = lazy(() => import('./pages/ActivitiesPage.jsx'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage.jsx'));
const SettingsPage = lazy(() => import('./pages/SettingsPage.jsx'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage.jsx'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage.jsx'));

// Simple Loading Spinner
const FullScreenLoader = () => (
  <div className="flex h-screen items-center justify-center bg-gray-50">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
  </div>
);

function App() {

  // For Socket and event 
  useEffect(() => {
    // Connect with backend
    const socket = io('http://localhost:8000');

    socket.on('connect', () => {
      console.log('🔌 Connected to WebSocket Server');
    });

    // lead_activity_update
    socket.on('lead_activity_update', (data) => {
      console.log('New Notification:', data);

      // Show the Toast Notfication
      if (data?.notification) {
        toast.info(data.notification, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    });

    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <BrowserRouter>
      {/* ToastContainer to add on app*/}
      <ToastContainer />

      <Routes>
        {/* Public Routes - No Layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Protected Routes - Wrapped in Layout */}
        <Route
          element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'SALES_EXECUTIVE']} />}
        >
          {/* Dashboard */}
          <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />

          {/* Leads Management */}
          <Route path="/leads" element={<Layout><LeadsPage /></Layout>} />
          <Route path="/leads/new" element={<Layout><CreateLeadPage /></Layout>} />
          <Route path="/leads/:id" element={<Layout><ViewLeadPage /></Layout>} />
          <Route path="/leads/:id/edit" element={<Layout><EditLeadPage /></Layout>} />
          <Route path="/leads/:id/activities" element={<Layout><ActivitiesPage /></Layout>} />

          {/* Activities */}
          <Route path="/activities" element={<Layout><ActivitiesPage /></Layout>} />

          {/* Analytics (Protected for Admin/Manager in Sidebar, but route accessible) */}
          <Route path="/analytics" element={<Layout><AnalyticsPage /></Layout>} />

          {/* Settings */}
          <Route path="/settings" element={<Layout><SettingsPage /></Layout>} />

          {/* Default Redirect */}
          <Route path="/" element={<Layout><DashboardPage /></Layout>} />
        </Route>

        {/* 404 Page */}
        <Route path="*" element={
          <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-800">
            <h1 className="text-6xl font-bold text-indigo-600">404</h1>
            <p className="text-xl mt-4">Page Not Found</p>
            <a href="/" className="mt-4 text-indigo-600 hover:underline">Go Home</a>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
