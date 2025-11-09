import axios from 'axios';

// Create axios instance with base URL pointing to your backend
const api = axios.create({
  baseURL: 'http://localhost:3000', // Backend runs on port 3000 (removed /api to avoid duplication)
  withCredentials: true, // Include cookies in requests if using sessions
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status } = error.response || {};
    
    // Handle unauthorized access
    if (status === 401) {
      // Clear auth data
      // localStorage.removeItem('token');
      // localStorage.removeItem('user');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Handle other common errors
    if (status === 404) {
      console.error('Requested resource not found');
    } else if (status >= 500) {
      console.error('Server error occurred');
    }
    
    return Promise.reject(error);
  }
);

// API functions
const getCurrentUser = async () => {
  const response = await api.get('/api/users/me');
  return response.data;
};

const login = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password });
  return response.data;
};

const register = async (userData) => {
  console.log("userData frontend", userData)
  const response = await api.post('/api/auth/register', userData);
  return response;
};

export { getCurrentUser, login, register };

// Export the configured axios instance
export default api;