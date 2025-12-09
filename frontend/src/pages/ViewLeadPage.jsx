import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetLeadByIdQuery } from '../features/leads/leadsApiSlice';
import { selectCurrentUser } from '../features/auth/authSlice';
import ActivityTimeline from '../components/ActivityTimeline';
import {
    ArrowLeft,
    Edit2,
    Building2,
    Mail,
    Phone,
    User,
    Briefcase,
    Loader2,
    Calendar
} from 'lucide-react';

const ViewLeadPage = () => {
    // Get lead ID from URL parameters
    const { id } = useParams();
    const navigate = useNavigate();

    // Get current user from Redux store
    const currentUser = useSelector(selectCurrentUser);

    // Fetch lead data
    const { data, isLoading } = useGetLeadByIdQuery(id);

    // Extract lead from API response
    const lead = data?.data?.lead || data?.data;

    // Get status badge styling
    const getStatusStyle = (status) => {
        switch (status) {
            case 'NEW': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'CONTACTED': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'QUALIFIED': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'WON': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'LOST': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                    <p className="text-slate-600 font-medium">Loading lead details...</p>
                </div>
            </div>
        );
    }

    // If no lead found
    if (!lead) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                    <p className="text-slate-600 font-medium">Lead not found</p>
                    <button
                        onClick={() => navigate('/leads')}
                        className="mt-4 text-indigo-600 hover:underline"
                    >
                        Back to Leads
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
            {/* Page Header - responsive */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Back button */}
                <button
                    onClick={() => navigate('/leads')}
                    className="flex items-center text-slate-600 hover:text-indigo-600 transition-colors font-semibold"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Leads
                </button>

                {/* Edit button */}
                <Link
                    to={`/leads/${id}/edit`}
                    className="flex-1 sm:flex-none flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] font-semibold"
                >
                    <Edit2 size={16} className="mr-2" />
                    Edit Lead
                </Link>
            </div>

            {/* Main Grid Layout - responsive */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Lead Details (Read-Only) */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden">
                        {/* Header */}
                        <div className="p-6 border-b-2 border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                                    <Briefcase size={22} className="mr-2 text-indigo-600" />
                                    Lead Information
                                </h2>
                                {/* Status badge */}
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold border-2 ${getStatusStyle(lead.status)}`}>
                                    {lead.status}
                                </span>
                            </div>
                        </div>

                        {/* Lead Details Grid - Read Only */}
                        <div className="p-6 space-y-6">

                            {/* Name Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* First Name */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                                        First Name
                                    </label>
                                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border-2 border-slate-200">
                                        <User className="text-slate-400" size={20} />
                                        <span className="text-slate-900 font-semibold">{lead.firstName || '-'}</span>
                                    </div>
                                </div>

                                {/* Last Name */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                                        Last Name
                                    </label>
                                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border-2 border-slate-200">
                                        <User className="text-slate-400" size={20} />
                                        <span className="text-slate-900 font-semibold">{lead.lastName || '-'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                                        Email Address
                                    </label>
                                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border-2 border-slate-200">
                                        <Mail className="text-slate-400" size={20} />
                                        <span className="text-slate-900 font-semibold truncate">{lead.email || '-'}</span>
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                                        Phone Number
                                    </label>
                                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border-2 border-slate-200">
                                        <Phone className="text-slate-400" size={20} />
                                        <span className="text-slate-900 font-semibold">{lead.phone || '-'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Company and Owner Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Company */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                                        Company / Organization
                                    </label>
                                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border-2 border-slate-200">
                                        <Building2 className="text-slate-400" size={20} />
                                        <span className="text-slate-900 font-semibold">{lead.organization || '-'}</span>
                                    </div>
                                </div>

                                {/* Lead Owner */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                                        Lead Owner
                                    </label>
                                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border-2 border-slate-200">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                                            {lead.owner?.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <span className="text-slate-900 font-semibold">{lead.owner?.name || 'Unknown'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Created Date */}
                            {lead.createdAt && (
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                                        Created On
                                    </label>
                                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border-2 border-slate-200">
                                        <Calendar className="text-slate-400" size={20} />
                                        <span className="text-slate-900 font-semibold">
                                            {new Date(lead.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>

                {/* Right Column: Activity Timeline - responsive */}
                <div className="lg:col-span-1">
                    <ActivityTimeline leadId={id} />
                </div>

            </div>
        </div>
    );
};

export default ViewLeadPage;
