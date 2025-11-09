import { createAsyncThunk } from '@reduxjs/toolkit';
import { login as loginApi, register as registerApi, getCurrentUser } from '../../services/api';
import { setCredentials, logout as logoutAction } from './authSlice';

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { dispatch, rejectWithValue }) => {
    try {
      const response = await loginApi(email, password);
      const { user, token } = response;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Dispatch action to update state
      dispatch(setCredentials({ user, token }));
      
      return { user, token };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      const response = await registerApi(userData);
      
      // Check if response is successful and has data
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      const { token, user } = response.data;
      
      if (!token) {
        throw new Error('No authentication token received');
      }
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Dispatch action to update state
      dispatch(setCredentials({ user, token }));
      
      return { user, token };
    } catch (error) {
      console.error('Registration error:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        (error.message === 'No token received' ? 'Registration successful but failed to authenticate' : error.message) || 
        'Registration failed. Please try again.'
      );
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }
      
      const user = await getCurrentUser();
      dispatch(setCredentials({ user, token }));
      return user;
    } catch (error) {
      // Clear invalid token
      localStorage.removeItem('token');
      return rejectWithValue('Session expired. Please log in again.');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      // Clear token from localStorage
      localStorage.removeItem('token');
      
      // Dispatch logout action to clear state
      dispatch(logoutAction());
      
      // You can add additional cleanup here if needed
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      // In a real app, you would make an API call to update the user's profile
      // const response = await updateUserProfile(auth.user.id, userData);
      
      // For now, we'll just return the updated data
      const updatedUser = { ...auth.user, ...userData };
      
      // Update user in localStorage if needed
      if (localStorage.getItem('user')) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return updatedUser;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);
