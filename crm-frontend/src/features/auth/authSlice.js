import { createSlice } from '@reduxjs/toolkit';

// Helper function to load user data from localStorage
// This ensures that when the app loads, the previous session data is available.
const loadUserFromStorage = () => {
  try {
    // Get data from 'userAuth' key
    const serializedState = localStorage.getItem('userAuth');
    if (serializedState === null) {
      return { user: null, token: null, role: null };
    }
    // Parse JSON
    return JSON.parse(serializedState);
  } catch (e) {
    console.error("Error loading state from localStorage:", e);
    // Return null state on error
    return { user: null, token: null, role: null };
  }
};

// Load initial state from localStorage
const initialState = loadUserFromStorage();

/**
 * Create Auth Slice
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * @desc Sets credentials after login or token refresh.
     * @param {object} action.payload - { user, token }
     */
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      
      state.user = user;
      state.token = token;
      // Ensure role is taken from user object
      state.role = user ? user.role : null; 
      
      // 1. Save state to localStorage (Session Persistence)
      try {
        const serializedState = JSON.stringify({ 
            user: state.user, 
            token: state.token, 
            role: state.role 
        });
        localStorage.setItem('userAuth', serializedState);
      } catch (e) {
        console.error("Error saving state to localStorage:", e);
      }
    },
    
    /**
     * @desc Logs out the user and resets the state.
     */
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      
      // 2. Remove state from localStorage
      try {
        localStorage.removeItem('userAuth');
      } catch (e) {
        console.error("Error removing state from localStorage:", e);
      }
    },
  },
});

// Export Actions
export const { setCredentials, logout } = authSlice.actions;

// Export Reducer
export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
export const selectCurrentRole = (state) => state.auth.role;