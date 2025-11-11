// frontend/src/features/activities/ActivityItem.jsx
import { format } from 'date-fns';
import { Pencil, Trash2, Phone, Mail, Calendar, MessageSquare, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const getActivityIcon = (type) => {
  switch (type) {
    case 'call':
      return <Phone className="h-4 w-4" />;
    case 'email':
      return <Mail className="h-4 w-4" />;
    case 'meeting':
      return <Calendar className="h-4 w-4" />;
    case 'note':
      return <MessageSquare className="h-4 w-4" />;
    default:
      return <CheckCircle className="h-4 w-4" />;
  }
};

export const ActivityItem = ({ 
  activity, 
  onEdit, 
  onDelete,
  isCurrentUserOwner 
}) => {
  const { id, type, title, description, createdAt, createdBy } = activity;

  return (
    <div className="border rounded-lg p-4 mb-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-full bg-primary/10 text-primary">
            {getActivityIcon(type)}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium">{title}</h4>
              <Badge variant="outline" className="text-xs">
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
            <div className="flex items-center text-xs text-muted-foreground mt-2 space-x-4">
              <span>By {createdBy?.name || 'Unknown'}</span>
              <span>•</span>
              <span>{format(new Date(createdAt), 'MMM d, yyyy h:mm a')}</span>
            </div>
          </div>
        </div>
        {isCurrentUserOwner && (
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onEdit(activity)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onDelete(id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};