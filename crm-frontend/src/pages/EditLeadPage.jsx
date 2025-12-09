import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    useGetLeadByIdQuery,
    useUpdateLeadMutation,
    useDeleteLeadMutation
} from '../features/leads/leadsApiSlice';
import { selectCurrentUser } from '../features/auth/authSlice';
import ActivityTimeline from '../components/ActivityTimeline';
import {
    ArrowLeft,
    Save,
    Trash2,
    Building2,
    Mail,
    Phone,
    User,
    Briefcase,
    Loader2
} from 'lucide-react';

const EditLeadPage = () => {
    // Get lead ID from URL parameters
    const { id } = useParams();
    const navigate = useNavigate();

    // Get current user from Redux store
    const currentUser = useSelector(selectCurrentUser);

    // Check if user has permission to delete (Admin and Manager only)
    const canDelete = ['ADMIN', 'MANAGER'].includes(currentUser?.role);

    // API Hooks for fetching and updating lead data
    const { data, isLoading } = useGetLeadByIdQuery(id);
    const [updateLead, { isLoading: isUpdating }] = useUpdateLeadMutation();
    const [deleteLead, { isLoading: isDeleting }] = useDeleteLeadMutation();

    // Form state management
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        organization: '',
        status: 'NEW'
    });

    // Populate form with lead data when it loads
    useEffect(() => {
        // Handle different API response structures
        const lead = data?.data?.lead || data?.data;

        if (lead) {
            const { firstName, lastName, email, phone, organization, status } = lead;
            setFormData({
                firstName: firstName || '',
                lastName: lastName || '',
                email: email || '',
                phone: phone || '',
                organization: organization || '',
                status: status || 'NEW'
            });
        }
    }, [data]);

    // Handle input field changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle form submission to update lead
    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateLead({ id, ...formData }).unwrap();
            toast.success('Lead updated successfully!');
        } catch (err) {
            toast.error(err.data?.message || 'Failed to update lead');
        }
    };

    // Handle lead deletion with confirmation
    const handleDelete = async () => {
        if (window.confirm('Delete this lead permanently? This cannot be undone.')) {
            try {
                await deleteLead(id).unwrap();
                toast.success('Lead deleted successfully!');
                navigate('/leads');
            } catch (err) {
                toast.error(err.data?.message || 'Failed to delete lead');
            }
        }
    };

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

                {/* Delete button - only for Admin/Manager */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {canDelete && (
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex-1 sm:flex-none flex items-center justify-center px-5 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl border-2 border-red-200 transition-all text-sm font-semibold disabled:opacity-50"
                        >
                            <Trash2 size={16} className="mr-2" />
                            {isDeleting ? 'Deleting...' : 'Delete Lead'}
                        </button>
                    )}
                </div>
            </div>

            {/* Main Grid Layout - responsive */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Lead Details Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden">
                        {/* Form Header */}
                        <div className="p-6 border-b-2 border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                                    <Briefcase size={22} className="mr-2 text-indigo-600" />
                                    Lead Information
                                </h2>
                                {/* Status badge */}
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold border-2 ${getStatusStyle(formData.status)}`}>
                                    {formData.status}
                                </span>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleUpdate} className="p-6 space-y-6">
                            {/* Name fields - responsive grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* First Name */}
                                <div className="group">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        First Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                        <input
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="pl-10 w-full py-3 px-4 rounded-xl border-2 border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            placeholder="John"
                                        />
                                    </div>
                                </div>

                                {/* Last Name */}
                                <div className="group">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Last Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                        <input
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="pl-10 w-full py-3 px-4 rounded-xl border-2 border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contact fields - responsive grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Email */}
                                <div className="group">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                        <input
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="pl-10 w-full py-3 px-4 rounded-xl border-2 border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="group">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Phone Number
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                        <input
                                            name="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="pl-10 w-full py-3 px-4 rounded-xl border-2 border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            placeholder="+1 (555) 123-4567"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Company and Status fields - responsive grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Company */}
                                <div className="group">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Company / Organization
                                    </label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                        <input
                                            name="organization"
                                            value={formData.organization}
                                            onChange={handleChange}
                                            className="pl-10 w-full py-3 px-4 rounded-xl border-2 border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            placeholder="Acme Corporation"
                                        />
                                    </div>
                                </div>

                                {/* Status Dropdown */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Pipeline Status
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full py-3 px-4 rounded-xl border-2 border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium"
                                    >
                                        <option value="NEW">New Lead</option>
                                        <option value="CONTACTED">Contacted</option>
                                        <option value="QUALIFIED">Qualified</option>
                                        <option value="WON">Closed (Won)</option>
                                        <option value="LOST">Closed (Lost)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Submit button */}
                            <div className="pt-6 border-t-2 border-slate-200 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className={`flex items-center px-6 py-3 rounded-xl shadow-lg text-sm font-semibold text-white transition-all duration-200 transform ${isUpdating
                                        ? 'bg-gradient-to-r from-indigo-400 to-purple-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                                        }`}
                                >
                                    {isUpdating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Saving Changes...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} className="mr-2" />
                                            Update Lead
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
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

export default EditLeadPage;