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
  console.log("credentials", credentials)
  const response = await api.post('/api/auth/login', credentials);
  console.log("response00", response.data)
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
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