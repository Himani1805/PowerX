import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateLeadMutation } from '../features/leads/leadsApiSlice';
import { UserPlus, Mail, Phone, Building2, User, X, Save, AlertCircle } from 'lucide-react';

const CreateLeadPage = () => {
  const navigate = useNavigate();

  // RTK Query mutation hook for creating leads
  const [createLead, { isLoading }] = useCreateLeadMutation();

  // Local state for form fields
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    organization: '',
  });

  // Error state management
  const [localError, setLocalError] = useState('');

  // Handle input field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    try {
      // Call create lead API
      await createLead(formData).unwrap();

      // On success, redirect to dashboard
      navigate('/leads');
    } catch (err) {
      // Display error message
      const errorMessage = err.data?.message || 'Failed to create lead. Please try again.';
      setLocalError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Create New Lead
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Enter the details of the potential customer below
              </p>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Error Message Display */}
          {localError && (
            <div className="mx-6 mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Error</p>
                <p className="text-sm text-red-700 mt-1">{localError}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Name Fields - responsive grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name Field */}
              <div className="group">
                <label htmlFor="firstName" className="block text-sm font-semibold text-slate-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className="block w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Last Name Field */}
              <div className="group">
                <label htmlFor="lastName" className="block text-sm font-semibold text-slate-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className="block w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Email Field - full width */}
            <div className="group">
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john.doe@example.com"
                  className="block w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Phone and Organization Fields - responsive grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Phone Field */}
              <div className="group">
                <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    className="block w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Organization Field */}
              <div className="group">
                <label htmlFor="organization" className="block text-sm font-semibold text-slate-700 mb-2">
                  Organization / Company
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="organization"
                    id="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    placeholder="Acme Corporation"
                    className="block w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Form Actions - responsive buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-6 border-t-2 border-slate-200">
              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => navigate('/leads')}
                className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border-2 border-slate-300 rounded-xl shadow-sm text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                disabled={isLoading}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white transition-all duration-200 transform ${isLoading
                    ? 'bg-gradient-to-r from-indigo-400 to-purple-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                  }`}
              >
                {isLoading ? (
                  <>
                    {/* Loading spinner */}
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Creating Lead...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Lead
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Helper Text */}
        <div className="mt-4 text-center">
          <p className="text-sm text-slate-500">
            Fields marked with <span className="text-red-500 font-semibold">*</span> are required
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateLeadPage;