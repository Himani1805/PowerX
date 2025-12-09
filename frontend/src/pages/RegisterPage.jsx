import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useRegisterMutation } from '../features/auth/authApiSlice';
import { setCredentials, selectCurrentToken } from '../features/auth/authSlice';
import { UserPlus, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';

const RegisterPage = () => {
  // Form state management
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // React Router and Redux hooks
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get current authentication token from Redux store
  const token = useSelector(selectCurrentToken);

  // RTK Query mutation hook for registration
  const [register, { isLoading, error }] = useRegisterMutation();

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [token, navigate]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    try {
      // Call the register API
      const result = await register({ name, email, password }).unwrap();

      // Save user credentials to Redux store
      dispatch(setCredentials({
        token: result.token,
        user: result.user
      }));

      // Navigate to dashboard after successful registration
      navigate('/dashboard');
    } catch (err) {
      // Display error message
      const errorMessage = err.data?.message || err.error || 'Registration failed. Please try again.';
      setLocalError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"></div>

      {/* Decorative background blur circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* Main registration card */}
      <div className="relative max-w-md w-full">
        {/* Glassmorphism card with backdrop blur */}
        <div className="bg-white/95 backdrop-blur-xl p-10 rounded-2xl shadow-2xl border border-white/20 transform transition-all duration-300 hover:shadow-indigo-500/20 hover:scale-[1.01]">

          {/* Header section with icon and title */}
          <div className="text-center mb-8">
            {/* Icon container with gradient background */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <UserPlus className="w-8 h-8 text-white" />
            </div>

            {/* Page title with gradient text */}
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Create Account
            </h2>

            {/* Subtitle */}
            <p className="text-gray-600 text-sm">
              Join our CRM platform as a Sales Executive
            </p>
          </div>

          {/* Registration form */}
          <form className="space-y-5" onSubmit={handleSubmit}>

            {/* Full Name input field */}
            <div className="group">
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Full Name
              </label>
              <div className="relative">
                {/* User icon - changes color on focus */}
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserPlus className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>

                {/* Input field */}
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email input field */}
            <div className="group">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                {/* Email icon */}
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>

                {/* Email input */}
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password input field */}
            <div className="group">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                {/* Lock icon */}
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>

                {/* Password input */}
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="block w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  disabled={isLoading}
                />

                {/* Show/Hide password toggle button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-indigo-500 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error message display */}
            {(localError || error) && (
              <div className="flex items-center gap-2 text-red-600 text-sm p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{localError}</span>
              </div>
            )}

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                className={`w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white transition-all duration-200 transform ${isLoading
                    ? 'bg-gradient-to-r from-indigo-400 to-purple-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    {/* Loading spinner */}
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                    Creating your account...
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Sign in link for existing users */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Footer text */}
        <div className="mt-6 text-center">
          <p className="text-white/80 text-xs">
            By registering, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;