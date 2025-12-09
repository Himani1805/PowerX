import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, selectCurrentToken } from '../features/auth/authSlice';
import { useLoginMutation } from '../features/auth/authApiSlice';
import { toast } from 'react-toastify';
import { LogIn, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

const LoginPage = () => {
    // Form state management
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // React Router and Redux hooks
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Get current authentication token from Redux store
    const token = useSelector(selectCurrentToken);

    // RTK Query mutation hook for login
    const [login, { isLoading }] = useLoginMutation();

    // Redirect to dashboard if user is already logged in
    useEffect(() => {
        if (token) {
            navigate('/dashboard');
        }
    }, [token, navigate]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Call the login API
            const userData = await login({ email, password }).unwrap();

            // Save user credentials to Redux store
            dispatch(setCredentials({ ...userData, user: userData.user }));

            // Show success message
            toast.success(`Welcome back, ${userData.user.name}!`);

            // Navigate to dashboard
            navigate('/dashboard');
        } catch (err) {
            // Display error message
            const errMsg = err.data?.message || 'Login failed';
            toast.error(errMsg);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600"></div>

            {/* Decorative background blur circles */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
            </div>

            {/* Main login card */}
            <div className="relative max-w-md w-full">
                {/* Glassmorphism card with backdrop blur */}
                <div className="bg-white/95 backdrop-blur-xl p-10 rounded-2xl shadow-2xl border border-white/20 transform transition-all duration-300 hover:shadow-blue-500/20 hover:scale-[1.01]">

                    {/* Header section with icon and title */}
                    <div className="text-center mb-8">
                        {/* Icon container with gradient background */}
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
                            <LogIn className="w-8 h-8 text-white" />
                        </div>

                        {/* Page title with gradient text */}
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                            Welcome Back
                        </h2>

                        {/* Subtitle */}
                        <p className="text-gray-600 text-sm">
                            Sign in to your PowerX CRM account
                        </p>
                    </div>

                    {/* Login form */}
                    <form className="space-y-5" onSubmit={handleSubmit}>

                        {/* Email input field */}
                        <div className="group">
                            <label
                                htmlFor="email"
                                className="block text-sm font-semibold text-gray-700 mb-2"
                            >
                                Email Address
                            </label>
                            <div className="relative">
                                {/* Email icon - changes color on focus */}
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
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
                                    className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
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
                                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>

                                {/* Password input */}
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="block w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                                    disabled={isLoading}
                                />

                                {/* Show/Hide password toggle button */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-500 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Forgot Password Link */}
                        <div className="flex items-center justify-end">
                            <Link
                                to="/forgot-password"
                                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                className={`w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white transition-all duration-200 transform ${isLoading
                                        ? 'bg-gradient-to-r from-blue-400 to-indigo-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                                    }`}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        {/* Loading spinner */}
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Sign up link for new users */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link
                                to="/register"
                                className="font-semibold text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                            >
                                Create account
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer text */}
                <div className="mt-6 text-center">
                    <p className="text-white/80 text-xs">
                        Secure login powered by PowerX CRM
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
