import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ActivityList } from '../features/activities/ActivityList';

const Activity = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!leadId) {
      navigate('/dashboard/leads'); // Redirect to leads list if no leadId
    }
  }, [leadId, navigate]);

  if (!leadId) {
    return null; // Or a loading spinner
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <ActivityList leadId={leadId} isOwner={true} />
      </div>
    </div>
  );
};

export default Activity;