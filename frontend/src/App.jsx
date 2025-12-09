import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { io } from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

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
  <div className="flex h-screen items-center justify-center bg-slate-50">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
  </div>
);

function App() {
  useEffect(() => {
    // Optimization: Use env var for socket URL if available
    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const socket = io(socketUrl);

    socket.on('connect', () => {
      console.log('🔌 Connected to WebSocket Server');
    });

    socket.on('lead_activity_update', (data) => {
      console.log('New Notification:', data);
      if (data?.notification) {
        toast.info(data.notification, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <BrowserRouter>
      <ToastContainer />
      <Suspense fallback={<FullScreenLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Protected Routes Wrapper */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'SALES_EXECUTIVE']} />}>

            {/* Layout Wrapper for Application Pages */}
            {/* This wrapper ensures Layout is rendered for all child routes */}
            <Route element={<Layout><Outlet /></Layout>}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />

              <Route path="/leads" element={<LeadsPage />} />
              <Route path="/leads/new" element={<CreateLeadPage />} />
              <Route path="/leads/:id" element={<ViewLeadPage />} />
              <Route path="/leads/:id/edit" element={<EditLeadPage />} />
              <Route path="/leads/:id/activities" element={<ActivitiesPage />} />

              <Route path="/activities" element={<ActivitiesPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* 404 Route */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-800">
              <h1 className="text-6xl font-bold text-indigo-600">404</h1>
              <p className="text-xl mt-4">Page Not Found</p>
              <a href="/" className="mt-4 text-indigo-600 hover:underline">Go Home</a>
            </div>
          } />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
