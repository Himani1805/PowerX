import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import leadsReducer from '../pages/leads/leadsSlice'; // Make sure this path is correct
import notificationReducer from '../features/notifications/notificationSlice.jsx';
import activitiesReducer from '../features/activities/activitySlice';
import { leadHistoryMiddleware } from '../middleware/leadHistory';
import { cacheMiddleware } from '../middleware/cache';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    leads: leadsReducer,
    notifications: notificationReducer,
    activities: activitiesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['leads/addToHistory'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['leads.history'],
      },
    }).concat(leadHistoryMiddleware, cacheMiddleware),
});