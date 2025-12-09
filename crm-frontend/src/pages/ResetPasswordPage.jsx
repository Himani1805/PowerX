import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useResetPasswordMutation } from '../features/auth/authApiSlice';
import { toast } from 'react-toastify';
import { Lock, ArrowLeft, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

const ResetPasswordPage = () => {
    // Get reset token from URL parameters
    const { token } = useParams();
    const navigate = useNavigate();

    // Form state management
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // RTK Query mutation hook for reset password
    const [resetPassword, { isLoading }] = useResetPasswordMutation();

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if passwords match
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        try {
            // Call the reset password API
            await resetPassword({ token, password }).unwrap();

            // Show success message
            toast.success('Password reset successfully! Please login.');

            // Navigate to login page
            navigate('/login');
        } catch (err) {
            // Display error message
            toast.error(err.data?.message || 'Failed to reset password');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600"></div>

            {/* Decorative background blur circles */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
            </div>

            {/* Main card */}
            <div className="relative max-w-md w-full">
                {/* Glassmorphism card with backdrop blur */}
                <div className="bg-white/95 backdrop-blur-xl p-10 rounded-2xl shadow-2xl border border-white/20 transform transition-all duration-300 hover:shadow-violet-500/20 hover:scale-[1.01]">

                    {/* Header section with icon and title */}
                    <div className="text-center mb-8">
                        {/* Icon container with gradient background */}
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
                            <Lock className="w-8 h-8 text-white" />
                        </div>

                        {/* Page title with gradient text */}
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
                            Reset Password
                        </h2>

                        {/* Subtitle */}
                        <p className="text-gray-600 text-sm">
                            Enter your new password below
                        </p>
                    </div>

                    {/* Reset password form */}
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* New Password input field */}
                        <div className="group">
                            <label
                                htmlFor="password"
                                className="block text-sm font-semibold text-gray-700 mb-2"
                            >
                                New Password
                            </label>
                            <div className="relative">
                                {/* Lock icon - changes color on focus */}
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
                                </div>

                                {/* Password input */}
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter new password (min 6 characters)"
                                    className="block w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                                    disabled={isLoading}
                                />

                                {/* Show/Hide password toggle button */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-violet-500 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password input field */}
                        <div className="group">
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-semibold text-gray-700 mb-2"
                            >
                                Confirm Password
                            </label>
                            <div className="relative">
                                {/* Lock icon */}
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
                                </div>

                                {/* Confirm password input */}
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter your password"
                                    className="block w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                                    disabled={isLoading}
                                />

                                {/* Show/Hide confirm password toggle button */}
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-violet-500 transition-colors"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Password match indicator */}
                        {password && confirmPassword && (
                            <div className={`flex items-center gap-2 text-sm p-3 rounded-xl ${password === confirmPassword
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                {password === confirmPassword ? (
                                    <>
                                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                        <span>Passwords match!</span>
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        <span>Passwords do not match</span>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Submit button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                className={`w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white transition-all duration-200 transform ${isLoading
                                        ? 'bg-gradient-to-r from-violet-400 to-purple-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                                    }`}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        {/* Loading spinner */}
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                                        Resetting password...
                                    </>
                                ) : (
                                    <>
                                        <span>Reset Password</span>
                                        <CheckCircle className="ml-2 w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Back to login link */}
                    <div className="mt-8 text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-violet-600 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Login
                        </Link>
                    </div>
                </div>

                {/* Footer text */}
                <div className="mt-6 text-center">
                    <p className="text-white/80 text-xs">
                        Your password will be encrypted and stored securely
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
