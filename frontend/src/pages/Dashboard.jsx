import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, TrendingUp, DollarSign, CheckCircle, Activity, Clock, Check, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/DashboardLayout';

const API_URL = 'http://localhost:3000/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalLeads: 0,
    activeLeads: 0,
    conversionRate: 0,
    totalValue: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In a real app, you would make an API call to your backend
        // For now, we'll use mock data
        const mockStats = {
          totalLeads: 24,
          activeLeads: 12,
          conversionRate: 24,
          totalValue: 125000,
        };

        const mockActivities = [
          {
            id: 1,
            title: 'New lead added',
            description: 'John Doe from Acme Corp',
            type: 'new_lead',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: 2,
            title: 'Deal closed',
            description: 'Project X - $12,000',
            type: 'deal_closed',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
          },
        ];

        setStats(mockStats);
        setRecentActivities(mockActivities);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Total Leads',
      value: stats.totalLeads,
      icon: Users,
      description: 'All leads in system',
      color: 'text-blue-500',
    },
    {
      title: 'Active Leads',
      value: stats.activeLeads,
      icon: TrendingUp,
      description: 'Currently being worked on',
      color: 'text-green-500',
    },
    {
      title: 'Conversion Rate',
      value: `${stats.conversionRate}%`,
      icon: CheckCircle,
      description: 'Lead to customer rate',
      color: 'text-purple-500',
    },
    {
      title: 'Pipeline Value',
      value: `$${stats.totalValue.toLocaleString()}`,
      icon: DollarSign,
      description: 'Total value of open deals',
      color: 'text-yellow-500',
    },
  ];

  const activityIcons = {
    new_lead: <Users className="h-5 w-5 text-blue-500" />,
    deal_closed: <Check className="h-5 w-5 text-green-500" />,
    task_completed: <CheckCircle className="h-5 w-5 text-purple-500" />,
    default: <Activity className="h-5 w-5 text-gray-500" />,
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading dashboard...</div>
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
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your CRM performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest updates from your team</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {recentActivities.map((activity) => {
                    const Icon = activityIcons[activity.type] || activityIcons.default;
                    return (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 pb-3 border-b border-border last:border-0"
                      >
                        <div className="flex-shrink-0 pt-0.5">
                          {Icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {activity.description}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-muted-foreground text-center py-8">
                  No recent activities
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/leads/new"
            className="block p-4 border rounded-lg hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Add New Lead</h3>
                <p className="text-sm text-muted-foreground">Create a new lead record</p>
              </div>
            </div>
          </Link>
          
          <Link
            to="/leads"
            className="block p-4 border rounded-lg hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100 text-green-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">View All Leads</h3>
                <p className="text-sm text-muted-foreground">Manage your leads</p>
              </div>
            </div>
          </Link>
          
          <Link
            to="/analytics"
            className="block p-4 border rounded-lg hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">View Analytics</h3>
                <p className="text-sm text-muted-foreground">See detailed reports</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;