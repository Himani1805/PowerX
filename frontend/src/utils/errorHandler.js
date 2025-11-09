import { toast } from 'react-toastify';

export const handleError = (error) => {
  const message = 
    (error.response && error.response.data && error.response.data.message) ||
    error.message ||
    error.toString();
  
  toast.error(message);
  return message;
};