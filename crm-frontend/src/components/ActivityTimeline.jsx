import React, { useState } from 'react';
import {
    useGetActivitiesQuery,
    useCreateActivityMutation
} from '../features/activities/activitiesApiSlice';
import {
    MessageSquare,
    Phone,
    Users,
    Send,
    Clock,
    FileText,
    CheckCircle
} from 'lucide-react';

const ActivityTimeline = ({ leadId }) => {
    const [type, setType] = useState('NOTE');
    const [content, setContent] = useState('');

    const { data, isLoading, isError } = useGetActivitiesQuery(leadId);
    const [createActivity, { isLoading: isCreating }] = useCreateActivityMutation();

    const activities = data?.data?.activities || [];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        try {
            await createActivity({ leadId, type, content }).unwrap();
            setContent('');
            setType('NOTE');
        } catch (err) {
            console.error('Failed to add activity:', err);
        }
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'CALL': return <Phone size={16} className="text-blue-600" />;
            case 'MEETING': return <Users size={16} className="text-purple-600" />;
            case 'STATUS_CHANGE': return <CheckCircle size={16} className="text-green-600" />;
            default: return <FileText size={16} className="text-slate-600" />;
        }
    };

    const getActivityColor = (type) => {
        switch (type) {
            case 'CALL': return 'bg-blue-100 border-blue-200';
            case 'MEETING': return 'bg-purple-100 border-purple-200';
            case 'STATUS_CHANGE': return 'bg-green-100 border-green-200';
            default: return 'bg-slate-100 border-slate-200';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2 text-indigo-600" />
                    Activity Timeline
                </h3>
                <span className="text-xs font-medium px-2 py-1 bg-white border border-slate-200 rounded-full text-slate-500">
                    {activities.length} Events
                </span>
            </div>

            {/* Timeline List */}
            <div className="flex-1 p-5 overflow-y-auto max-h-[500px] bg-white custom-scrollbar">
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : activities.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                        <Clock className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">No activities logged yet.</p>
                    </div>
                ) : (
                    <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                        {activities.map((activity) => (
                            <div key={activity.id} className="relative flex items-start group">
                                {/* Icon Bubble */}
                                <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 bg-white ${getActivityColor(activity.type)} shadow-sm`}>
                                    {getActivityIcon(activity.type)}
                                </div>

                                {/* Content Card */}
                                <div className="ml-4 flex-1">
                                    <div className="bg-white p-3.5 rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-all group-hover:border-indigo-100">
                                        <div className="flex justify-between items-start mb-1.5">
                                            <div>
                                                <span className="text-sm font-semibold text-slate-900 mr-2">
                                                    {activity.user?.name || 'User'}
                                                </span>
                                                <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                                                    {activity.type}
                                                </span>
                                            </div>
                                            <time className="text-xs text-slate-400 whitespace-nowrap ml-2">
                                                {formatDate(activity.createdAt)}
                                            </time>
                                        </div>
                                        <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                                            {activity.content}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Activity Form */}
            <div className="p-4 bg-slate-50 border-t border-slate-200">
                <form onSubmit={handleSubmit}>
                    <div className="flex gap-2 mb-2">
                        {['NOTE', 'CALL', 'MEETING'].map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setType(t)}
                                className={`flex-1 text-xs font-medium py-1.5 rounded-md border transition-colors ${type === t
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={`Add a ${type.toLowerCase()} details...`}
                            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm min-h-[80px] p-3 pr-10 resize-none"
                            required
                        />
                        <button
                            type="submit"
                            disabled={isCreating || !content.trim()}
                            className="absolute bottom-2 right-2 p-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                            <Send size={14} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ActivityTimeline;