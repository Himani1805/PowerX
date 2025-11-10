import api from './api';

export const register = async (userData) => {
  const response = await api.post('/api/auth/register', userData);
  console.log("response00", response.data.data)
  // if (response.data.data.token) {
  //   localStorage.setItem('token', response.data.data.token);
  //   localStorage.setItem('user', JSON.stringify(response.data.data.user));
  // }
  return response.data;
};

export const login = async (credentials) => {
  console.log("Login credentials:", credentials);
  try {
    const response = await api.post('/api/auth/login', credentials);
    console.log("Login response:", response.data);
    
    if (response.data.data && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      // Set the default Authorization header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`;
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};