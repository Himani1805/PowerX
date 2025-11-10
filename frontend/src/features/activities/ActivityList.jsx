import { useEffect, useState } from 'react';
import { ActivityItem } from './ActivityItem';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ActivityForm } from './ActivityForm';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  selectAllActivities,
  selectActivityStatus,
  selectActivityError,
  setCurrentActivity,
  clearCurrentActivity
} from './activitySlice';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const ActivityList = ({ leadId, isOwner = false }) => {
  const dispatch = useDispatch();
  const activities = useSelector(selectAllActivities);
  const status = useSelector(selectActivityStatus);
  const error = useSelector(selectActivityError);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (leadId) {
      dispatch(fetchActivities(leadId));
    }
  }, [dispatch, leadId]);

  const handleCreateActivity = async (activityData) => {
    try {
      await dispatch(createActivity({ leadId, activityData })).unwrap();
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create activity:', error);
    }
  };

  const handleUpdateActivity = async (activityData) => {
    try {
      await dispatch(updateActivity({ 
        activityId: activityData.id, 
        activityData 
      })).unwrap();
      dispatch(clearCurrentActivity());
    } catch (error) {
      console.error('Failed to update activity:', error);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await dispatch(deleteActivity(activityId)).unwrap();
      } catch (error) {
        console.error('Failed to delete activity:', error);
      }
    }
  };

  const handleEditActivity = (activity) => {
    dispatch(setCurrentActivity(activity));
    setShowForm(true);
  };

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error loading activities: {error || 'Unknown error occurred'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Activities</h3>
        {isOwner && (
          <Button
            size="sm"
            onClick={() => {
              dispatch(clearCurrentActivity());
              setShowForm(!showForm);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {showForm ? 'Hide Form' : 'Add Activity'}
          </Button>
        )}
      </div>

      {showForm && (
        <div className="bg-card p-4 rounded-lg border mb-6">
          <ActivityForm
            initialData={null}
            onSubmit={handleCreateActivity}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No activities found. {isOwner && 'Add your first activity!'}
          </div>
        ) : (
          activities.map((activity) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              onEdit={handleEditActivity}
              onDelete={handleDeleteActivity}
              isCurrentUserOwner={isOwner}
            />
          ))
        )}
      </div>
    </div>
  );
};