import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useGetLeadStatusStatsQuery, useGetLeadOwnerStatsQuery } from '../features/analytics/analyticsApiSlice';
import { BarChart2, PieChart as PieChartIcon, RefreshCw, Loader2, TrendingUp } from 'lucide-react';

// Status colors mapping
const STATUS_COLORS = {
  NEW: '#3b82f6',       // Blue
  CONTACTED: '#f59e0b', // Amber
  QUALIFIED: '#8b5cf6', // Violet
  LOST: '#ef4444',      // Red
  WON: '#10b981',       // Emerald
};

// Color palette for charts - expanded for more variety
const COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#a855f7', // Violet
];

const AnalyticsPage = () => {
  // Fetch analytics data from API
  const {
    data: statusData,
    isLoading: statusLoading,
    isError: statusError,
    refetch: refetchStatus
  } = useGetLeadStatusStatsQuery();

  const {
    data: ownerData,
    isLoading: ownerLoading
  } = useGetLeadOwnerStatsQuery();

  // Extract data from API responses
  const statsByStatus = statusData?.data || [];
  const rawStatsByOwner = ownerData?.data || [];

  // Process owner stats to limit pie chart segments
  // Show top 8 owners, group the rest as "Others"
  const MAX_SEGMENTS = 8;
  let statsByOwner = [];

  if (rawStatsByOwner.length > MAX_SEGMENTS) {
    // Sort by count (descending)
    const sorted = [...rawStatsByOwner].sort((a, b) => b.count - a.count);

    // Take top 8
    const topOwners = sorted.slice(0, MAX_SEGMENTS);

    // Sum up the rest
    const othersCount = sorted.slice(MAX_SEGMENTS).reduce((sum, owner) => sum + owner.count, 0);

    // Combine
    statsByOwner = [
      ...topOwners,
      { ownerName: 'Others', count: othersCount }
    ];
  } else {
    statsByOwner = rawStatsByOwner;
  }

  // Loading state
  if (statusLoading || ownerLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          <p className="text-slate-600 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (statusError) {
    return (
      <div className="p-8 text-center bg-red-50 border-2 border-red-200 rounded-2xl">
        <p className="text-red-700 font-semibold mb-4">Failed to load analytics data</p>
        <button
          onClick={refetchStatus}
          className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-medium"
        >
          <RefreshCw size={16} className="mr-2" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header - responsive */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-slate-600 mt-1">Performance metrics and lead distribution insights</p>
        </div>

        {/* Refresh button */}
        <button
          onClick={refetchStatus}
          className="flex items-center px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all font-medium shadow-sm"
          title="Refresh Data"
        >
          <RefreshCw size={18} className="mr-2" />
          Refresh
        </button>
      </div>

      {/* Charts Grid - responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Chart 1: Leads by Status (Bar Chart) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300">
          {/* Chart Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mr-3 text-indigo-600">
                  <BarChart2 size={24} />
                </div>
                Leads by Status
              </h2>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statsByStatus}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="status"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 13 }}
                  allowDecimals={false}
                  layout="horizontal"
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc', radius: 4 }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const color = STATUS_COLORS[data.status] || '#6366f1';
                      return (
                        <div className="bg-white p-4 border border-slate-100 shadow-xl rounded-2xl min-w-[150px]">
                          <div className="flex items-center mb-2">
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: color }}></div>
                            <span className="text-slate-500 font-medium text-sm">{label}</span>
                          </div>
                          <div className="flex items-end gap-2">
                            <span className="text-2xl font-bold text-slate-800">{payload[0].value}</span>
                            <span className="text-slate-400 font-medium text-sm mb-1">Leads</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="count"
                  radius={[12, 12, 0, 0]}
                  animationDuration={1500}
                >
                  {statsByStatus.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.status] || '#6366f1'}
                      strokeWidth={0}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Leads by Owner (Pie Chart) */}
        <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-lg">
          {/* Chart Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-4 border-b-2 border-slate-100 gap-3">
            <h2 className="text-lg font-bold text-slate-800 flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-3 shadow-md">
                <PieChartIcon size={20} className="text-white" />
              </div>
              Distribution by Owner
            </h2>
            {/* Info badge */}
            {rawStatsByOwner.length > MAX_SEGMENTS && (
              <div className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-semibold border border-purple-200">
                Showing top {MAX_SEGMENTS} owners
              </div>
            )}
          </div>

          {/* Pie Chart */}
          <div className="h-80 w-full flex items-center justify-center">
            {statsByOwner.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statsByOwner}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="ownerName"
                  >
                    {statsByOwner.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke="#fff"
                        strokeWidth={3}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      padding: '12px'
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={60}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '13px', fontWeight: 600 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              // Empty state
              <div className="flex flex-col items-center text-slate-400">
                <TrendingUp size={48} className="mb-3 opacity-30" />
                <p className="font-medium">No data available</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsPage;