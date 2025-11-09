import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [leadsOverTime, setLeadsOverTime] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Replace with your actual API endpoint
      const response = await axios.get(`${API_URL}/analytics/leads-over-time`);
      setLeadsOverTime(response.data);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // For demo purposes - will be removed when backend is ready
  useEffect(() => {
    if (leadsOverTime.length === 0 && !loading) {
      // Mock data for demonstration
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentYear = new Date().getFullYear();
      
      const mockData = months.map((month, index) => ({
        month: `${month} ${currentYear}`,
        count: Math.floor(Math.random() * 50) + 10,
        value: Math.floor(Math.random() * 50000) + 10000
      }));

      setLeadsOverTime(mockData);
    }
  }, [loading, leadsOverTime]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading analytics...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">{error}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Performance metrics and insights</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Leads Over Time Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Leads Over Time</CardTitle>
              <CardDescription>Track your lead generation progress</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={leadsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis yAxisId="left" orientation="left" stroke="#3B82F6" />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke="#10B981" 
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Tooltip 
                    formatter={(value, name) => 
                      name === 'Total Value' ? `$${Number(value).toLocaleString()}` : value
                    }
                  />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="count" 
                    stroke="#3B82F6" 
                    name="Lead Count" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="value" 
                    stroke="#10B981" 
                    name="Total Value ($)" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Additional Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Sources</CardTitle>
                <CardDescription>Where your leads are coming from</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Lead source distribution chart will be displayed here
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>Lead to customer conversion</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Conversion funnel visualization will be displayed here
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;