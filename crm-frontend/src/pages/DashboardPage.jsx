import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetLeadsQuery, useDeleteLeadMutation, useGetDashboardStatusQuery } from '../features/leads/leadsApiSlice';
import { selectCurrentUser } from '../features/auth/authSlice';
import {
  Users,
  TrendingUp,
  CheckCircle,
  Edit2,
  Trash2,
  AlertCircle,
  Loader2
} from 'lucide-react';

const DashboardPage = () => {
  // Get current user data from Redux store
  const user = useSelector(selectCurrentUser);
  const userRole = user?.role;

  // Check if user is Manager or Admin (for permissions)
  const isManagerOrAdmin = ['ADMIN', 'MANAGER'].includes(userRole);

  // Fetch leads data with automatic refetching on mount, focus, and reconnect
  const { data, isLoading, isError, error } = useGetLeadsQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  // Fetch dashboard statistics
  const { data: statsData } = useGetDashboardStatusQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  // RTK Query mutation for deleting leads
  const [deleteLead] = useDeleteLeadMutation();

  // Normalize API response - handle different response structures
  const leads = (
    data?.data?.leads ??
    data?.data?.items ??
    data?.leads ??
    data?.items ??
    data?.data ??
    []
  );

  // Calculate statistics from backend data
  const statusCounts = statsData?.data || [];
  const totalLeadsCount = statusCounts.reduce((acc, curr) => acc + curr.count, 0);
  const wonLeadsCount = statusCounts.find(s => s.status === 'WON')?.count || 0;
  const newLeadsCount = statusCounts.find(s => s.status === 'NEW')?.count || 0;

  // Dynamic labels based on user role
  const totalLeadsLabel = isManagerOrAdmin ? "Company Total Leads" : "My Total Leads";
  const wonLeadsLabel = isManagerOrAdmin ? "Team Wins" : "My Wins";

  // Dashboard statistics cards configuration
  const stats = [
    {
      title: totalLeadsLabel,
      value: totalLeadsCount,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    },
    {
      title: 'New Leads',
      value: newLeadsCount,
      icon: TrendingUp,
      color: 'bg-amber-500',
      bgColor: 'bg-gradient-to-br from-amber-50 to-amber-100',
      textColor: 'text-amber-600',
      borderColor: 'border-amber-200'
    },
    {
      title: wonLeadsLabel,
      value: wonLeadsCount,
      icon: CheckCircle,
      color: 'bg-emerald-500',
      bgColor: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
      textColor: 'text-emerald-600',
      borderColor: 'border-emerald-200'
    }
  ];

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

  // Handle lead deletion with confirmation
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await deleteLead(id).unwrap();
      } catch (err) {
        alert('Failed to delete lead');
      }
    }
  };

  // Loading state - show spinner while fetching data
  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          <p className="text-slate-600 font-medium">Loading your dashboard...</p>
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
          <h3 className="font-bold text-lg">Failed to load data</h3>
          <p className="text-sm mt-1">{error?.data?.message || 'Something went wrong.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section with welcome message */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Dashboard Overview
        </h1>
        <p className="text-slate-600 mt-1">Welcome back, <span className="font-semibold text-slate-900">{user?.name}</span>!</p>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`bg-white p-6 rounded-2xl shadow-md border-2 ${stat.borderColor} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02]`}
          >
            <div className="flex items-center">
              {/* Icon container with gradient background */}
              <div className={`w-14 h-14 rounded-xl ${stat.bgColor} flex items-center justify-center mr-4 shadow-sm`}>
                <stat.icon className={stat.textColor} size={28} strokeWidth={2.5} />
              </div>

              {/* Stat information */}
              <div>
                <p className="text-slate-500 text-sm font-semibold uppercase tracking-wide">{stat.title}</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Leads Table Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Table Header */}
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Recent Leads</h2>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b-2 border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Company</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.length > 0 ? (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                    {/* Lead Name */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{lead.firstName} {lead.lastName}</div>
                    </td>

                    {/* Lead Status Badge */}
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 ${getStatusStyle(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>

                    {/* Lead Email */}
                    <td className="px-6 py-4 text-slate-600 text-sm">{lead.email}</td>

                    {/* Lead Company */}
                    <td className="px-6 py-4 text-slate-600 text-sm">{lead.organization || '-'}</td>

                    {/* Action Buttons */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        {/* Edit Button */}
                        <Link
                          to={`/leads/${lead.id}`}
                          className="p-2.5 rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-all duration-200 transform hover:scale-110"
                          title="Edit Lead"
                        >
                          <Edit2 size={16} />
                        </Link>

                        {/* Delete Button - Only visible for Admin/Manager */}
                        {isManagerOrAdmin && (
                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="p-2.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-200 transform hover:scale-110"
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
                // Empty state when no leads exist
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                        <Users className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-500 font-medium">No leads found</p>
                      <p className="text-slate-400 text-sm">Create your first lead to get started</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;