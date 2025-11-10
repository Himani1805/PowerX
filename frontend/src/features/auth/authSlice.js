import { createSlice } from '@reduxjs/toolkit';
import {
  login,
  register,
  fetchCurrentUser,
  logout as logoutThunk,
  updateProfile
} from './authThunks';

// Helper function to get initial state from localStorage
const getInitialState = () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  return {
    user: userStr ? JSON.parse(userStr) : null,
    token: token,
    status: token ? 'succeeded' : 'idle',
    error: null,
  };
};

// Initial state
const initialState = getInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, { payload }) => {
      const { user, token } = payload;
      state.user = user;
      state.token = token;
      state.status = 'succeeded';
      state.error = null;
      // Update localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
      // Clear localStorage on logout
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, { payload }) => {
        state.status = 'succeeded';
        state.user = payload.user;
        state.token = payload.token;
        // Update localStorage
        localStorage.setItem('token', payload.token);
        localStorage.setItem('user', JSON.stringify(payload.user));
      })
      .addCase(login.rejected, (state, { payload }) => {
        state.status = 'failed';
        state.error = payload || 'Login failed';
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, { payload }) => {
        state.status = 'succeeded';
        state.error = null;
        // Don't set user or token here, just mark as succeeded
      })
      .addCase(register.rejected, (state, { payload }) => {
        state.status = 'failed';
        state.error = payload || 'Registration failed';
      })
      
      // Fetch Current User
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, { payload }) => {
        state.status = 'succeeded';
        state.user = payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, { payload }) => {
        state.status = 'failed';
        state.error = payload;
        state.token = null;
      })
      
      // Logout
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.status = 'idle';
      })
      
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, { payload }) => {
        state.status = 'succeeded';
        state.user = payload;
      })
      .addCase(updateProfile.rejected, (state, { payload }) => {
        state.status = 'failed';
        state.error = payload || 'Failed to update profile';
      });
  },
});

// Export actions
export const { setCredentials, logout, clearError } = authSlice.actions;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => !!state.auth.token;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;