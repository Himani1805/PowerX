import { isRejectedWithValue } from '@reduxjs/toolkit';

export const leadHistoryMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  
  if (action.type.endsWith('/fulfilled')) {
    const state = store.getState();
    const user = state.auth.user;
    const currentTime = new Date().toISOString();

    // Handle different action types
    if (action.type.startsWith('leads/updateLead') && action.meta?.arg) {
      const { id, ...changes } = action.meta.arg;
      store.dispatch({
        type: 'leads/addToHistory',
        payload: {
          leadId: id,
          entry: {
            timestamp: currentTime,
            userId: user?.id,
            userName: user?.name || 'System',
            changes,
            type: 'UPDATE'
          }
        }
      });
    }
  }

  return result;
};