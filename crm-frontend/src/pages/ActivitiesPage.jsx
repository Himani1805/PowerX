import React, { useState, useEffect } from 'react';
import { useGetLeadsQuery } from '../features/leads/leadsApiSlice';
import ActivityTimeline from '../components/ActivityTimeline';
import { MessageSquare, User, Loader2, Users } from 'lucide-react';

const ActivitiesPage = () => {
    // Fetch ALL leads data (without pagination limit)
    // Using a large limit to get all leads at once
    const { data, isLoading } = useGetLeadsQuery({
        page: 1,
        limit: 1000 // Large limit to get all leads
    });

    // State to track which lead's activities to display
    const [selectedLeadId, setSelectedLeadId] = useState(null);

    // Extract leads from API response - handle different response structures
    const leads = data?.data?.leads || data?.data || [];

    // Automatically select the first lead when data loads
    useEffect(() => {
        if (leads.length > 0 && !selectedLeadId) {
            setSelectedLeadId(leads[0].id);
        }
    }, [leads, selectedLeadId]);

    // Loading state
    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                    <p className="text-slate-600 font-medium">Loading activities...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Activities
                </h1>
                <p className="text-slate-600 mt-1">View and track all lead activities and interactions</p>
            </div>

            {/* Main Content - responsive layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">

                {/* Left Side: List of Leads - responsive */}
                <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg border-2 border-slate-200 flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="p-5 border-b-2 border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-bold text-slate-800 text-lg">Select a Lead</h2>
                                <p className="text-xs text-slate-600 mt-1">View timeline for specific lead</p>
                            </div>
                            {/* Lead count badge */}
                            <div className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold border-2 border-indigo-200">
                                {leads.length} {leads.length === 1 ? 'Lead' : 'Leads'}
                            </div>
                        </div>
                    </div>

                    {/* Leads List - scrollable */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {leads.length === 0 ? (
                            // Empty state
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6">
                                <Users className="w-12 h-12 mb-3 opacity-30" />
                                <p className="text-sm font-medium">No leads found</p>
                                <p className="text-xs mt-1">Create a lead to see activities</p>
                            </div>
                        ) : (
                            // Leads list
                            leads.map((lead) => (
                                <div
                                    key={lead.id}
                                    onClick={() => setSelectedLeadId(lead.id)}
                                    className={`p-4 rounded-xl cursor-pointer flex items-center gap-3 transition-all duration-200 ${selectedLeadId === lead.id
                                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-300 shadow-md'
                                        : 'hover:bg-slate-50 border-2 border-transparent hover:border-slate-200'
                                        }`}
                                >
                                    {/* Lead Avatar */}
                                    <div className={`h-11 w-11 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${selectedLeadId === lead.id
                                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                                        : 'bg-slate-200 text-slate-600'
                                        }`}>
                                        {lead.firstName?.charAt(0).toUpperCase() || 'L'}
                                    </div>

                                    {/* Lead Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`text-sm font-semibold truncate ${selectedLeadId === lead.id ? 'text-indigo-900' : 'text-slate-700'
                                            }`}>
                                            {lead.firstName} {lead.lastName}
                                        </h3>
                                        <p className="text-xs text-slate-500 truncate">
                                            {lead.organization || lead.email}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Side: Activity Timeline - responsive */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border-2 border-slate-200 overflow-hidden flex flex-col">
                    {selectedLeadId ? (
                        // Show activity timeline for selected lead
                        <div className="flex-1 overflow-y-auto">
                            <ActivityTimeline leadId={selectedLeadId} />
                        </div>
                    ) : (
                        // Empty state when no lead is selected
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <MessageSquare size={40} className="opacity-30" />
                            </div>
                            <p className="text-lg font-semibold text-slate-500">No Lead Selected</p>
                            <p className="text-sm mt-2">Select a lead from the list to view activity history</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActivitiesPage;
