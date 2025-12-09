import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForgotPasswordMutation } from '../features/auth/authApiSlice';
import { toast } from 'react-toastify';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';

const ForgotPasswordPage = () => {
    // Form state management
    const [email, setEmail] = useState('');

    // RTK Query mutation hook for forgot password
    const [forgotPassword, { isLoading, isSuccess }] = useForgotPasswordMutation();

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Call the forgot password API
            await forgotPassword(email).unwrap();

            // Show success message
            toast.success('Password reset link sent to your email!');
        } catch (err) {
            // Display error message
            toast.error(err.data?.message || 'Failed to send reset email');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600"></div>

            {/* Decorative background blur circles */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
            </div>

            {/* Main card */}
            <div className="relative max-w-md w-full">
                {/* Glassmorphism card with backdrop blur */}
                <div className="bg-white/95 backdrop-blur-xl p-10 rounded-2xl shadow-2xl border border-white/20 transform transition-all duration-300 hover:shadow-emerald-500/20 hover:scale-[1.01]">

                    {/* Header section with icon and title */}
                    <div className="text-center mb-8">
                        {/* Icon container with gradient background */}
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
                            <Mail className="w-8 h-8 text-white" />
                        </div>

                        {/* Page title with gradient text */}
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                            Forgot Password?
                        </h2>

                        {/* Subtitle */}
                        <p className="text-gray-600 text-sm">
                            Enter your email to receive a reset link
                        </p>
                    </div>

                    {/* Show form if email not sent yet, otherwise show success message */}
                    {!isSuccess ? (
                        <form onSubmit={handleSubmit} className="space-y-5">

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
                                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
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
                                        className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Submit button */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className={`w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white transition-all duration-200 transform ${isLoading
                                            ? 'bg-gradient-to-r from-emerald-400 to-teal-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                                        }`}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            {/* Loading spinner */}
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                                            Sending reset link...
                                        </>
                                    ) : (
                                        <>
                                            <span>Send Reset Link</span>
                                            <Send className="ml-2 w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        // Success message after email is sent
                        <div className="flex items-center gap-3 p-5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700">
                            <CheckCircle className="w-6 h-6 flex-shrink-0" />
                            <div>
                                <p className="font-semibold">Email sent successfully!</p>
                                <p className="text-sm mt-1">Check your inbox for the reset link</p>
                            </div>
                        </div>
                    )}

                    {/* Back to login link */}
                    <div className="mt-8 text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Login
                        </Link>
                    </div>
                </div>

                {/* Footer text */}
                <div className="mt-6 text-center">
                    <p className="text-white/80 text-xs">
                        Remember your password?{' '}
                        <Link to="/login" className="underline hover:text-white transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
