import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/auth/authSlice';
import { User, Shield, Mail, Building, CheckCircle } from 'lucide-react';

const SettingsPage = () => {
  // Get current user data from Redux store
  const user = useSelector(selectCurrentUser);

  // Format role name for display
  const formatRole = (role) => {
    if (!role) return 'User';
    return role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Account Settings
        </h1>
        <p className="text-slate-600 mt-1">Manage your profile and account information</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 overflow-hidden">
        {/* Header Banner with gradient */}
        <div className="h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 relative">
          {/* Profile Avatar */}
          <div className="absolute -bottom-14 left-8">
            <div className="w-28 h-28 bg-white rounded-2xl p-1.5 shadow-xl">
              <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center text-indigo-600">
                <User size={48} strokeWidth={2} />
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="pt-20 pb-8 px-8">
          {/* User Name and Status */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">{user?.name || 'User'}</h2>
              <p className="text-slate-500 font-medium mt-1">{formatRole(user?.role)}</p>
            </div>

            {/* Active Status Badge */}
            <span className="flex items-center px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 rounded-xl text-sm font-bold border-2 border-emerald-200 shadow-sm">
              <CheckCircle size={16} className="mr-2" />
              Active Account
            </span>
          </div>

          {/* User Information Grid - responsive */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t-2 border-slate-100 pt-8">

            {/* Email Information */}
            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border-2 border-slate-200">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Email Address</p>
                <p className="text-slate-900 font-semibold truncate">{user?.email || 'Not provided'}</p>
              </div>
            </div>

            {/* Role/Permission Information */}
            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border-2 border-slate-200">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Permission Level</p>
                <p className="text-slate-900 font-semibold">{formatRole(user?.role)}</p>
              </div>
            </div>

            {/* Organization Information */}
            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border-2 border-slate-200 md:col-span-2">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Organization</p>
                <p className="text-slate-900 font-semibold">PowerX CRM Platform</p>
              </div>
            </div>

          </div>

          {/* Additional Information */}
          <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-100">
            <h3 className="text-sm font-bold text-indigo-900 mb-2">Account Information</h3>
            <p className="text-sm text-indigo-700">
              Your account is fully active and configured. Contact your administrator if you need to update your role or permissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;