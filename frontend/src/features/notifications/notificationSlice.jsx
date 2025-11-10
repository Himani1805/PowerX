import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { io } from 'socket.io-client';

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

// Initialize socket connection
let socket;
const getSocket = (token) => {
  if (!socket && token) {
    socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      path: '/socket.io/',
      auth: { token },
      transports: ['websocket'],
    });
  }
  return socket;
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
  message: null,
  socket: null,
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
      state.items.unshift(action.payload);
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
        // Merge with existing notifications, preserving unread status for existing ones
        const existingNotifications = new Map(state?.items?.map(n => [n._id, n]));
        const merged = action.payload?.map(notification => ({
          ...notification,
          read: existingNotifications.get(notification._id)?.read ?? notification.read
        }));
        state.items = merged;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Mark as Read
      .addCase(markNotificationAsRead.pending, (state, action) => {
        // Optimistic update
        const notification = state.items.find(n => n._id === action.meta.arg);
        if (notification) {
          notification.read = true;
        }
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        // Handle success - update any additional data if needed
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

// Middleware for WebSocket events
export const setupSocketListeners = (dispatch, getState) => {
  const { auth } = getState();
  if (!auth.user?.token) return;

  const socket = getSocket(auth.user.token);
  
  socket.on('connect', () => {
    console.log('Connected to WebSocket server');
  });

  socket.on('notification_created', (notification) => {
    console.log('New notification received:', notification);
    dispatch(addNotification(notification));
    
    // Play sound for new notifications
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/logo192.png',
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket server');
  });

  return () => {
    socket.off('notification_created');
    socket.off('connect');
    socket.off('disconnect');
  };
};

export const { 
  resetNotifications, 
  addNotification, 
  initializeSocket,
  markAsReadLocally 
} = notificationSlice.actions;

// Selectors
export const selectAllNotifications = (state) => state.notifications.notifications;
export const selectUnreadNotifications = (state) =>
  state.notifications.notifications.filter((n) => !n.isRead);
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export const selectNotificationsStatus = (state) => state.notifications.status;
export const selectNotificationsError = (state) => state.notifications.error;
export const selectNotificationsMessage = (state) => state.notifications.message;

export default notificationSlice.reducer;
