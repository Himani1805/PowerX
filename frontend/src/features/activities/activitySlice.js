import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchActivities = createAsyncThunk(
  'activities/fetchActivities',
  async (leadId, { rejectWithValue }) => {
    try {
      console.log('Fetching activities for lead:', leadId);
      const response = await api.get(`/api/leads/${leadId}/history`);
      console.log('Activities response:', response.data);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching activities:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch activities');
    }
  }
);

export const createActivity = createAsyncThunk(
  'activities/createActivity',
  async ({ leadId, activityData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/leads/${leadId}/activities`, activityData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create activity');
    }
  }
);

export const updateActivity = createAsyncThunk(
  'activities/updateActivity',
  async ({ activityId, activityData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/activities/${activityId}`, activityData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update activity');
    }
  }
);

export const deleteActivity = createAsyncThunk(
  'activities/deleteActivity',
  async (activityId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/activities/${activityId}`);
      return activityId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete activity');
    }
  }
);

const initialState = {
  activities: [],
  status: 'idle',
  error: null,
  currentActivity: null,
};

const activitySlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    setCurrentActivity: (state, action) => {
      state.currentActivity = action.payload;
    },
    clearCurrentActivity: (state) => {
      state.currentActivity = null;
    },
    resetActivityState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivities.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.activities = action.payload;
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createActivity.fulfilled, (state, action) => {
        state.activities.unshift(action.payload);
      })
      .addCase(updateActivity.fulfilled, (state, action) => {
        const index = state.activities.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.activities[index] = action.payload;
        }
        state.currentActivity = null;
      })
      .addCase(deleteActivity.fulfilled, (state, action) => {
        state.activities = state.activities.filter(
          activity => activity.id !== action.payload
        );
      });
  },
});

export const { 
  setCurrentActivity, 
  clearCurrentActivity, 
  resetActivityState 
} = activitySlice.actions;

// Selectors
export const selectAllActivities = (state) => state.activities.activities;
export const selectActivityStatus = (state) => state.activities.status;
export const selectActivityError = (state) => state.activities.error;
export const selectCurrentActivity = (state) => state.activities.currentActivity;

export default activitySlice.reducer;