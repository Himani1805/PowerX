import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Calendar } from '@/components/ui/Calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover';
import { cn } from '@/lib/utils';
import { useDispatch, useSelector } from 'react-redux';
import { selectAllLeads, fetchLeads } from '../../pages/leads/leadsSlice';

const ACTIVITY_TYPES = [
  { value: 'CALL', label: 'Phone Call' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'MEETING', label: 'Meeting' },
  { value: 'NOTE', label: 'Note' },
];

export const ActivityForm = ({ 
  initialData, 
  onSubmit, 
  onCancel,
  isLoading = false 
}) => {
  const [date, setDate] = useState(initialData?.dueDate ? new Date(initialData.dueDate) : new Date());
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: initialData || {
      type: 'CALL',
      leadId: '',
      title: '',
      description: '',
      dueDate: new Date(),
    }
  });
  const dispatch = useDispatch();
  const leads = useSelector(selectAllLeads);
  const activityType = watch('type');

  useEffect(() => {
    // Fetch leads when component mounts
    dispatch(fetchLeads({}));
  }, [dispatch]);

  useEffect(() => {
    if (initialData) {
      setValue('leadId', initialData.leadId);
      setValue('type', initialData.type);
      setValue('title', initialData.title);
      setValue('description', initialData.description);
      if (initialData.dueDate) {
        setDate(new Date(initialData.dueDate));
      }
    }
  }, [initialData, setValue]);
// console.log("Activity form 62", leads)
  // const handleFormSubmit = (data) => {
  //   console.log("Activity form 65", data)
  //   onSubmit({
  //     ...data,
  //     leadId: data.leadId,
  //     dueDate: date.toISOString(),
  //   });
  // };
  const handleFormSubmit = async (data) => {
    try {
      console.log("Form data:", data);
      // Ensure type is in the correct case (uppercase)
      const activityData = {
        type: data.type.toUpperCase(),
        content: data.description || '',
        title: data.title || '',
        dueDate: date.toISOString()
      };
      
      // Only include leadId if it exists
      if (data.leadId) {
        activityData.leadId = data.leadId;
      }
      
      console.log("Submitting activity:", activityData);
      await onSubmit(activityData);
      
      // Reset form after successful submission if this is a new activity
      if (!initialData) {
        setValue('type', 'CALL');
        setValue('title', '');
        setValue('description', '');
        setValue('leadId', '');
        setDate(new Date());
      }
    } catch (error) {
      console.error('Error submitting activity:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Lead</label>
        <Select 
          value={watch('leadId')} 
          onValueChange={(value) => setValue('leadId', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select lead" />
          </SelectTrigger>
          <SelectContent>
            {leads.map((lead) => (
              <SelectItem key={lead.id} value={lead.id}>
                {lead.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

       <div>
        <label className="block text-sm font-medium mb-1">Activity Type</label>
        <Select 
          value={watch('type')} 
          onValueChange={(value) => setValue('type', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select activity type" />
          </SelectTrigger>
          <SelectContent>
            {ACTIVITY_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <Input
          {...register('title', { required: 'Title is required' })}
          placeholder="Enter activity title"
        />
        {errors.title && (
          <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea
          {...register('description')}
          placeholder="Enter activity details"
          rows={4}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Due Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {initialData ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            initialData ? 'Update Activity' : 'Create Activity'
          )}
        </Button>
      </div>
    </form>
  );
};