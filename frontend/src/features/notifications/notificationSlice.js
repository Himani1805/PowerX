import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/notifications';

// Helper function to get auth config
const getAuthConfig = (getState) => {
  const { auth } = getState();
  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth.user.token}`,
    },
  };
};

// Async thunks for API calls
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { getState, rejectWithValue }) => {
    try {
      const config = getAuthConfig(getState);
      const response = await axios.get(API_URL, config);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch notifications'
      );
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { getState, rejectWithValue }) => {
    try {
      const config = getAuthConfig(getState);
      const response = await axios.put(
        `${API_URL}/${notificationId}/read`,
        {},
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to mark notification as read'
      );
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { getState, rejectWithValue }) => {
    try {
      const config = getAuthConfig(getState);
      const response = await axios.put(
        `${API_URL}/read-all`,
        {},
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to mark all notifications as read'
      );
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId, { getState, rejectWithValue }) => {
    try {
      const config = getAuthConfig(getState);
      await axios.delete(`${API_URL}/${notificationId}`, config);
      return notificationId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete notification'
      );
    }
  }
);

const initialState = {
  notifications: [],
  unreadCount: 0,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  message: '',
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    resetNotifications: (state) => {
      state.status = 'idle';
      state.error = null;
      state.message = '';
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    // Fetch Notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.notifications = action.payload.notifications || [];
        state.unreadCount = action.payload.unread || 0;
        state.error = null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Mark Notification as Read
      .addCase(markNotificationAsRead.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.notifications.findIndex(
          (n) => n.id === action.payload.id
        );
        if (index !== -1) {
          state.notifications[index] = action.payload;
        }
        state.unreadCount = Math.max(0, state.unreadCount - 1);
        state.message = 'Notification marked as read';
        state.error = null;
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Mark All Notifications as Read
      .addCase(markAllNotificationsAsRead.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.status = 'succeeded';
        state.notifications = state.notifications.map(notification => ({
          ...notification,
          isRead: true
        }));
        state.unreadCount = 0;
        state.message = 'All notifications marked as read';
        state.error = null;
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Delete Notification
      .addCase(deleteNotification.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification && !notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter(
          (n) => n.id !== action.payload
        );
        state.message = 'Notification deleted';
        state.error = null;
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { resetNotifications, addNotification } = notificationSlice.actions;

// Selectors
export const selectAllNotifications = (state) => state.notifications.notifications;
export const selectUnreadNotifications = (state) =>
  state.notifications.notifications.filter((n) => !n.isRead);
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export const selectNotificationsStatus = (state) => state.notifications.status;
export const selectNotificationsError = (state) => state.notifications.error;
export const selectNotificationsMessage = (state) => state.notifications.message;

export default notificationSlice.reducer;
