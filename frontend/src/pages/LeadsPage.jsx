import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetLeadsQuery, useDeleteLeadMutation } from '../features/leads/leadsApiSlice';
import { selectCurrentUser } from '../features/auth/authSlice';
import { useDebounce } from 'use-debounce';
import {
    Plus,
    Search,
    Edit2,
    Eye,
    Trash2,
    AlertCircle,
    Filter,
    Loader2,
    Users
} from 'lucide-react';

const LeadsPage = () => {
    // Get current user from Redux store
    const user = useSelector(selectCurrentUser);
    const navigate = useNavigate();

    // State management for search, filters, and pagination
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch] = useDebounce(searchQuery, 500); // Debounce search to avoid too many API calls
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [page, setPage] = useState(1);
    const limit = 10; // Number of leads per page

    // Check if user has permission to delete leads (Admin and Manager only)
    const isManagerOrAdmin = ['ADMIN', 'MANAGER'].includes(user?.role);

    // Build query parameters for API call
    const queryParams = {
        page,
        limit,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        search: debouncedSearch || undefined,
    };

    // Fetch leads data with real-time updates
    const { data, isLoading, isError, error } = useGetLeadsQuery(queryParams, {
        refetchOnMountOrArgChange: true,
        refetchOnFocus: true,
        refetchOnReconnect: true,
    });

    // RTK Query mutation for deleting leads
    const [deleteLead] = useDeleteLeadMutation();

    // Extract leads and pagination data from API response
    const leads = data?.data || [];
    const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

    // Handle lead deletion with confirmation
    const handleDelete = async (e, id) => {
        e.stopPropagation(); // Prevent row click event
        if (window.confirm('Are you sure you want to permanently delete this lead?')) {
            try {
                await deleteLead(id).unwrap();
            } catch (err) {
                alert('Failed to delete lead: ' + (err.data?.message || 'Unknown error'));
            }
        }
    };

    // Get status badge styling based on lead status
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

    // Loading state - show spinner while fetching data
    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                    <p className="text-slate-600 font-medium">Loading leads...</p>
                </div>
            </div>
        );
    }

    // Error state - show error message if data fetch fails
    if (isError) {
        return (
            <div className="p-6 bg-red-50 border-2 border-red-200 rounded-xl flex items-start text-red-700">
                <AlertCircle className="mr-3 flex-shrink-0 mt-0.5" size={20} />
                <div>
                    <h3 className="font-bold text-lg">Error loading leads</h3>
                    <p className="text-sm mt-1">{error?.data?.message || 'Something went wrong.'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header - responsive layout */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Leads
                    </h1>
                    <p className="text-slate-600 mt-1">Manage your pipeline and sales opportunities</p>
                </div>

                {/* Create Lead Button - responsive */}
                <Link
                    to="/leads/new"
                    className="w-full sm:w-auto flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] font-semibold"
                >
                    <Plus size={20} className="mr-2" />
                    Create Lead
                </Link>
            </div>

            {/* Filters & Search Bar - responsive layout */}
            <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200">
                <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
                    {/* Search Input - full width on mobile */}
                    <div className="relative w-full lg:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search leads by name, email, company..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Status Filter Dropdown */}
                    <div className="flex items-center gap-2">
                        {/* <Filter size={18} className="text-slate-500" /> */}
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                            className="w-full lg:w-auto px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="NEW">New Lead</option>
                            <option value="CONTACTED">Contacted</option>
                            <option value="QUALIFIED">Qualified</option>
                            <option value="WON">Closed (Won)</option>
                            <option value="LOST">Closed (Lost)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Leads Table - responsive with horizontal scroll on mobile */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50 border-b-2 border-slate-200">
                                <th className="px-4 lg:px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Name</th>
                                <th className="px-4 lg:px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                                <th className="px-4 lg:px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Contact</th>
                                <th className="px-4 lg:px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Company</th>
                                <th className="px-4 lg:px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Owner</th>
                                <th className="px-4 lg:px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {leads.length > 0 ? (
                                leads.map((lead) => (
                                    <tr
                                        key={lead.id}
                                        onClick={() => navigate(`/leads/${lead.id}`)}
                                        className="hover:bg-slate-50 transition-colors cursor-pointer group"
                                    >
                                        {/* Lead Name */}
                                        <td className="px-4 lg:px-6 py-4">
                                            <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                                {lead.firstName} {lead.lastName}
                                            </div>
                                        </td>

                                        {/* Lead Status Badge */}
                                        <td className="px-4 lg:px-6 py-4">
                                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 whitespace-nowrap ${getStatusStyle(lead.status)}`}>
                                                {lead.status}
                                            </span>
                                        </td>

                                        {/* Contact Information */}
                                        <td className="px-4 lg:px-6 py-4">
                                            <div className="text-sm text-slate-900">{lead.email}</div>
                                            <div className="text-xs text-slate-500">{lead.phone || '-'}</div>
                                        </td>

                                        {/* Company Name */}
                                        <td className="px-4 lg:px-6 py-4 text-sm text-slate-600">{lead.organization || 'N/A'}</td>

                                        {/* Lead Owner */}
                                        <td className="px-4 lg:px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold mr-2 shadow-sm">
                                                    {lead.owner?.name?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                                <span className="text-sm text-slate-600 font-medium">{lead.owner?.name || 'Unknown'}</span>
                                            </div>
                                        </td>

                                        {/* Action Buttons */}
                                        <td className="px-4 lg:px-6 py-4">
                                            <div className="flex justify-end space-x-2">
                                                {/* View Button */}
                                                <Link
                                                    to={`/leads/${lead.id}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all duration-200 transform hover:scale-110"
                                                    title="View Lead"
                                                >
                                                    <Eye size={16} />
                                                </Link>

                                                {/* Edit Button */}
                                                <Link
                                                    to={`/leads/${lead.id}/edit`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="p-2 rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-all duration-200 transform hover:scale-110"
                                                    title="Edit Lead"
                                                >
                                                    <Edit2 size={16} />
                                                </Link>

                                                {/* Delete Button - Only for Admin/Manager */}
                                                {isManagerOrAdmin && (
                                                    <button
                                                        onClick={(e) => handleDelete(e, lead.id)}
                                                        className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-200 transform hover:scale-110"
                                                        title="Delete Lead"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                // Empty state when no leads found
                                <tr>
                                    <td colSpan="6" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                                                <Users className="w-8 h-8 text-slate-400" />
                                            </div>
                                            <p className="text-slate-500 font-medium">No leads found</p>
                                            <p className="text-slate-400 text-sm">Try adjusting your search or filters</p>
                                            <Link
                                                to="/leads/new"
                                                className="mt-2 text-indigo-600 hover:text-indigo-700 font-semibold hover:underline"
                                            >
                                                Create your first lead
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls - responsive */}
                <div className="px-4 lg:px-6 py-4 border-t-2 border-slate-200 bg-slate-50">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        {/* Results count */}
                        <div className="text-sm text-slate-600">
                            Showing <span className="font-bold text-slate-900">{leads.length}</span> of <span className="font-bold text-slate-900">{pagination.total}</span> leads
                        </div>

                        {/* Pagination buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 border-2 border-slate-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-all"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border-2 border-slate-300 rounded-lg">
                                Page {page} of {pagination.totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                disabled={page >= pagination.totalPages}
                                className="px-4 py-2 border-2 border-slate-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeadsPage;