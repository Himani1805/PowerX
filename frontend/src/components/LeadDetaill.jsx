import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  DollarSign, 
  Calendar,
  Plus,
  MessageSquare,
  PhoneCall,
  Video,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

export const LeadDetail = ({ lead, onClose, onUpdate }) => {
  const [activities, setActivities] = useState([]);
  const [newActivity, setNewActivity] = useState({
    activity_type: 'note',
    title: '',
    description: '',
  });
  const [addingActivity, setAddingActivity] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load activities for this lead
  useEffect(() => {
    loadActivities();

    // Set up realtime subscription for activities
    const activitiesSubscription = supabase
      .channel(`activities-${lead.id}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'activities',
          filter: `lead_id=eq.${lead.id}` 
        },
        () => {
          loadActivities();
        }
      )
      .subscribe();

    return () => {
      activitiesSubscription.unsubscribe();
    };
  }, [lead.id]);

  const loadActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          user:profiles!activities_created_by_fkey(full_name)
        `)
        .eq('lead_id', lead.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setActivities(data);
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  const handleAddActivity = async () => {
    if (!newActivity.title) {
      toast.error('Please enter an activity title');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('activities')
        .insert([{
          lead_id: lead.id,
          activity_type: newActivity.activity_type,
          title: newActivity.title,
          description: newActivity.description || null,
          created_by: user.id,
        }]);

      if (error) throw error;

      toast.success('Activity added successfully');
      setNewActivity({
        activity_type: 'note',
        title: '',
        description: '',
      });
      setAddingActivity(false);
    } catch (error) {
      console.error('Error adding activity:', error);
      toast.error(error.message || 'Failed to add activity');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'call':
        return <PhoneCall className="h-4 w-4" />;
      case 'meeting':
        return <Video className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'status_change':
        return <FileText className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-500',
      contacted: 'bg-purple-500',
      qualified: 'bg-yellow-500',
      proposal: 'bg-orange-500',
      won: 'bg-green-500',
      lost: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">{lead.company_name}</h2>
            <p className="text-muted-foreground">{lead.contact_name}</p>
          </div>
          <Badge className={getStatusColor(lead.status)}>
            {lead.status}
          </Badge>
        </div>

        {/* Lead Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{lead.email}</span>
          </div>
          {lead.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{lead.phone}</span>
            </div>
          )}
          {lead.value && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">${Number(lead.value).toLocaleString()}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Created {new Date(lead.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Notes */}
        {lead.notes && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <h3 className="text-sm font-medium mb-2">Notes</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{lead.notes}</p>
          </div>
        )}
      </div>

      <Separator />

      {/* Activity Timeline */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Activity Timeline</h3>
          {!addingActivity && (
            <Button size="sm" onClick={() => setAddingActivity(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Activity
            </Button>
          )}
        </div>

        {/* Add Activity Form */}
        {addingActivity && (
          <div className="mb-6 p-4 border rounded-lg bg-card">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Activity Type</Label>
                <Select
                  value={newActivity.activity_type}
                  onValueChange={(value) =>
                    setNewActivity({ ...newActivity, activity_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="note">Note</SelectItem>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="status_change">Status Change</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={newActivity.title}
                  onChange={(e) =>
                    setNewActivity({ ...newActivity, title: e.target.value })
                  }
                  placeholder="Brief summary of the activity"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newActivity.description}
                  onChange={(e) =>
                    setNewActivity({ ...newActivity, description: e.target.value })
                  }
                  placeholder="Detailed description (optional)"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setAddingActivity(false);
                    setNewActivity({
                      activity_type: 'note',
                      title: '',
                      description: '',
                    });
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddActivity} disabled={loading}>
                  {loading ? 'Adding...' : 'Add Activity'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Activities List */}
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No activities yet. Add your first activity!
            </div>
          ) : (
            activities.map((activity, index) => (
              <div
                key={activity.id}
                className="flex gap-4 pb-4 border-b border-border last:border-0"
              >
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                    {getActivityIcon(activity.activity_type)}
                  </div>
                  {index < activities.length - 1 && (
                    <div className="flex-1 w-px bg-border my-2" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{activity.title}</h4>
                      {activity.description && (
                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                          {activity.description}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.activity_type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <span>{activity.user?.full_name || 'Unknown'}</span>
                    <span>•</span>
                    <span>{new Date(activity.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};