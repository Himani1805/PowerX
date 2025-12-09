import { configureStore } from "@reduxjs/toolkit";

// Reducers
import authReducer from "../features/auth/authSlice";

// RTK Query Base API Slice
import { apiSlice } from "./api/apiSlice";
// Import Leads API Slice
import { leadsApiSlice } from "../features/leads/leadsApiSlice";

/**
 * Configure Redux Store
 * All Slices and Middleware will be included here.
 */
export const store = configureStore({
  // Add reducers here
  reducer: {
    // Auth Reducer
    auth: authReducer,

    // 2. Add apiSlice Reducer at its reducerPath
    // This handles leadsApiSlice and all other injected endpoints
    [apiSlice.reducerPath]: apiSlice.reducer,
  },

  // 3. Add apiSlice middleware
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Disable check for non-serializable values (like dates)
      serializableCheck: false,
    }).concat(apiSlice.middleware), // Add apiSlice middleware

  // Enable DevTools for development
  devTools: process.env.NODE_ENV !== "production",
});
