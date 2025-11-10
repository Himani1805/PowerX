import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, TrendingUp, DollarSign, CheckCircle, Activity, Clock, Check, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="h-screen p-4 md:p-6 space-y-8 max-w-7xl mx-auto">
  
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.color.replace('text', 'bg').replace('-500', '-100')}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 space-y-6">
          {/* <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Activities</CardTitle>
                  <CardDescription>Latest updates from your team</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="text-primary">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => {
                    const Icon = activityIcons[activity.type] || activityIcons.default;
                    return (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {Icon}
                        </div>
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <p className="text-sm font-medium leading-tight">{activity.title}</p>
                          <p className="text-xs text-muted-foreground leading-tight">
                            {activity.description}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap self-start">
                          {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent activities to display
                  </div>
                )}
              </div>
            </CardContent>
          </Card> */}

          {/* Quick Stats / Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lead Status Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Lead Status</CardTitle>
                <CardDescription>Distribution of leads by status</CardDescription>
              </CardHeader>
              <CardContent className="h-64 w-full">
                <div className="h-full w-full min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'New', value: 40 },
                        { name: 'Contacted', value: 30 },
                        { name: 'Qualified', value: 20 },
                        { name: 'Closed', value: 10 },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[0, 1, 2, 3].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
                <CardDescription>Weekly lead conversion</CardDescription>
              </CardHeader>
              <CardContent className="h-64 w-full">
                <div className="h-full w-full min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Mon', leads: 12, converted: 4 },
                      { name: 'Tue', leads: 8, converted: 3 },
                      { name: 'Wed', leads: 15, converted: 6 },
                      { name: 'Thu', leads: 10, converted: 4 },
                      { name: 'Fri', leads: 18, converted: 7 },
                      { name: 'Sat', leads: 5, converted: 2 },
                      { name: 'Sun', leads: 2, converted: 1 },
                    ]}
                    margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="leads" fill="#3B82F6" name="Leads" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="converted" fill="#10B981" name="Converted" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link
                to="/leads/new"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors border"
              >
                <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Add New Lead</h3>
                  <p className="text-xs text-muted-foreground">Create a new lead record</p>
                </div>
              </Link>
              
              <Link
                to="/leads"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors border"
              >
                <div className="p-2 rounded-full bg-green-100 text-green-600">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">View All Leads</h3>
                  <p className="text-xs text-muted-foreground">Manage your leads</p>
                </div>
              </Link>
              
              <Link
                to="/analytics"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors border"
              >
                <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">View Analytics</h3>
                  <p className="text-xs text-muted-foreground">See detailed reports</p>
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          {/* <Card>
            <CardHeader>
              <CardTitle>Upcoming Tasks</CardTitle>
              <CardDescription>Your schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Follow up with John</p>
                    <p className="text-xs text-muted-foreground">Tomorrow, 10:00 AM</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-green-500 flex-shrink-0"></div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Team Meeting</p>
                    <p className="text-xs text-muted-foreground">Tomorrow, 2:00 PM</p>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4">
                View All Tasks
              </Button>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;