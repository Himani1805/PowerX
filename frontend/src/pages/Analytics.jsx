import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Activity, Users, TrendingUp, BarChart2, Clock, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import api from '../services/api';
import useWebSocket from '../hooks/useWebSocket';

// WebSocket URL
const WS_URL = process.env.NODE_ENV === 'production' 
  ? `wss://${window.location.host}/ws` 
  : 'ws://localhost:3000/ws';

const COLORS = ['#008080', '#00b3b3', '#00cccc', '#00e6e6', '#00ffff'];

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [leadsOverTime, setLeadsOverTime] = useState([]);
  const [leadSources, setLeadSources] = useState([]);
  const [conversionRates, setConversionRates] = useState([]);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRealTime, setIsRealTime] = useState(true);
  const [wsStatus, setWsStatus] = useState('disconnected');

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const [leadsResponse, sourcesResponse, conversionResponse] = await Promise.all([
        api.get(`/analytics/leads-over-time?range=${timeRange}`),
        api.get('/analytics/lead-sources'),
        api.get('/analytics/conversion-rates')
      ]);

      setLeadsOverTime(leadsResponse.data);
      setLeadSources(sourcesResponse.data);
      setConversionRates(conversionResponse.data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error loading analytics:', err);
      handleLoadError();
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  const handleLoadError = () => {
    setError('Failed to load analytics data. Showing sample data.');
    
    // Mock data for demonstration
    const months = timeRange === 'month' 
      ? Array.from({ length: 12 }, (_, i) => ({
          date: new Date(2023, i, 1).toLocaleString('default', { month: 'short' }),
          count: Math.floor(Math.random() * 50) + 20
        }))
      : Array.from({ length: 4 }, (_, i) => ({
          date: `Q${i + 1} 2023`,
          count: Math.floor(Math.random() * 200) + 100
        }));
        
    setLeadsOverTime(months);
    
    setLeadSources([
      { name: 'Website', value: 45 },
      { name: 'Referral', value: 25 },
      { name: 'Social Media', value: 15 },
      { name: 'Email', value: 10 },
      { name: 'Other', value: 5 }
    ]);
    
    setConversionRates([
      { name: 'New', value: 60 },
      { name: 'Contacted', value: 30 },
      { name: 'Qualified', value: 20 },
      { name: 'Proposal', value: 10 },
      { name: 'Closed Won', value: 5 }
    ]);
    
    setLastUpdated(new Date());
  };

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((data) => {
    if (data.type === 'analytics_update' && isRealTime) {
      setLeadsOverTime(data.data.leadsOverTime);
      setLeadSources(data.data.leadSources);
      setConversionRates(data.data.conversionRates);
      setLastUpdated(new Date(data.data.timestamp));
    }
  }, [isRealTime]);

  // Initialize WebSocket connection
  const { isConnected, error: wsError } = useWebSocket(
    WS_URL,
    handleWebSocketMessage
  );

  // Update WebSocket status
  useEffect(() => {
    setWsStatus(isConnected ? 'connected' : 'disconnected');
  }, [isConnected]);

  // Load initial data
  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Calculate stats from data
  const stats = [
    { 
      title: 'Total Leads', 
      value: leadsOverTime.reduce((sum, item) => sum + item.count, 0).toLocaleString(),
      change: '+12%', 
      icon: <Users className="h-6 w-6 text-teal-500" /> 
    },
    { 
      title: 'Conversion Rate', 
      value: conversionRates.length > 0 
        ? ((conversionRates.find(r => r.name === 'Closed Won')?.value / conversionRates[0]?.value) * 100 || 0).toFixed(1) + '%'
        : '0%', 
      change: '+2.3%', 
      icon: <TrendingUp className="h-6 w-6 text-teal-500" /> 
    },
    { 
      title: 'Avg. Response Time', 
      value: '2h 15m', 
      change: '-30m', 
      icon: <Clock className="h-6 w-6 text-teal-500" /> 
    },
    { 
      title: 'Active Deals', 
      value: (leadsOverTime[leadsOverTime.length - 1]?.count || 0).toLocaleString(), 
      change: leadsOverTime.length > 1 
        ? (leadsOverTime[leadsOverTime.length - 1].count > leadsOverTime[leadsOverTime.length - 2].count ? '+' : '') + 
          ((leadsOverTime[leadsOverTime.length - 1].count / leadsOverTime[leadsOverTime.length - 2].count - 1) * 100).toFixed(1) + '%'
        : '0%', 
      icon: <Activity className="h-6 w-6 text-teal-500" /> 
    },
  ];

  if (loading && leadsOverTime.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-center">
          <div className="h-12 w-12 rounded-full bg-teal-100 mx-auto mb-4"></div>
          <p className="text-teal-600 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-500">
            {lastUpdated && `Last updated: ${new Date(lastUpdated).toLocaleTimeString()}`}
            {!isConnected && ' (offline)'}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-sm text-gray-500">
            {wsStatus === 'connected' ? (
              <>
                <Wifi className="h-4 w-4 text-green-500 mr-1" />
                <span>Live Updates</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-500 mr-1" />
                <span>Offline Mode</span>
              </>
            )}
          </div>
          <button
            onClick={() => {
              setIsRealTime(!isRealTime);
              if (!isRealTime) {
                loadAnalytics();
              }
            }}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              isRealTime 
                ? 'bg-teal-100 text-teal-800 hover:bg-teal-200' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {isRealTime ? 'Live' : 'Paused'}
          </button>
          <button
            onClick={loadAnalytics}
            className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Leads Over Time</CardTitle>
                <CardDescription>Number of new leads over the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={leadsOverTime}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: '#6b7280' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fill: '#6b7280' }}
                        axisLine={false}
                        tickLine={false}
                        width={40}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          borderRadius: '0.5rem',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          border: '1px solid #e5e7eb',
                          padding: '0.75rem',
                          fontSize: '0.875rem'
                        }}
                        labelStyle={{
                          fontWeight: 600,
                          color: '#111827',
                          marginBottom: '0.5rem'
                        }}
                        formatter={(value) => [value, 'Leads']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#0d9488" 
                        strokeWidth={2}
                        dot={{
                          fill: '#0d9488',
                          stroke: '#fff',
                          strokeWidth: 2,
                          r: 4,
                          style: { filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.1))' }
                        }}
                        activeDot={{
                          r: 6,
                          fill: '#0d9488',
                          stroke: '#fff',
                          strokeWidth: 3
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Lead Sources */}
            <Card>
              <CardHeader>
                <CardTitle>Lead Sources</CardTitle>
                <CardDescription>Where your leads are coming from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={leadSources}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {leadSources.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [`${value}%`, name]}
                        contentStyle={{
                          backgroundColor: 'white',
                          borderRadius: '0.5rem',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          border: '1px solid #e5e7eb',
                          padding: '0.75rem',
                          fontSize: '0.875rem'
                        }}
                      />
                      <Legend 
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        wrapperStyle={{
                          paddingLeft: '20px',
                          fontSize: '0.875rem',
                          color: '#4b5563'
                        }}
                        formatter={(value, entry, index) => (
                          <span className="text-gray-600">
                            {value} ({entry.payload.value}%)
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>How leads move through your sales pipeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={conversionRates}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      type="number" 
                      tick={{ fill: '#6b7280' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      scale="band"
                      tick={{ fill: '#6b7280' }}
                      axisLine={false}
                      tickLine={false}
                      width={120}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Conversion']}
                      contentStyle={{
                        backgroundColor: 'white',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e5e7eb',
                        padding: '0.75rem',
                        fontSize: '0.875rem'
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="#0d9488" 
                      radius={[0, 4, 4, 0]}
                      barSize={30}
                    >
                      {conversionRates.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                          style={{
                            filter: `drop-shadow(0 4px 6px ${COLORS[index % COLORS.length]}33)`,
                            transition: 'all 0.3s ease',
                          }}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

Analytics.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Analytics;