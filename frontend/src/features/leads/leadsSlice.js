import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/leads';

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
export const fetchLeads = createAsyncThunk(
  'leads/fetchLeads',
  async (_, { getState, rejectWithValue }) => {
    try {
      const config = getAuthConfig(getState);
      const response = await axios.get(API_URL, config);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch leads'
      );
    }
  }
);

export const fetchLeadById = createAsyncThunk(
  'leads/fetchLeadById',
  async (leadId, { getState, rejectWithValue }) => {
    try {
      const config = getAuthConfig(getState);
      const response = await axios.get(`${API_URL}/${leadId}`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch lead'
      );
    }
  }
);

export const createLead = createAsyncThunk(
  'leads/createLead',
  async (leadData, { getState, rejectWithValue }) => {
    try {
      const config = getAuthConfig(getState);
      const response = await axios.post(API_URL, leadData, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create lead'
      );
    }
  }
);

export const updateLead = createAsyncThunk(
  'leads/updateLead',
  async ({ id, ...leadData }, { getState, rejectWithValue }) => {
    try {
      const config = getAuthConfig(getState);
      const response = await axios.put(`${API_URL}/${id}`, leadData, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update lead'
      );
    }
  }
);

export const deleteLead = createAsyncThunk(
  'leads/deleteLead',
  async (leadId, { getState, rejectWithValue }) => {
    try {
      const config = getAuthConfig(getState);
      await axios.delete(`${API_URL}/${leadId}`, config);
      return leadId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete lead'
      );
    }
  }
);

export const transferLead = createAsyncThunk(
  'leads/transferLead',
  async ({ leadId, userId }, { getState, rejectWithValue }) => {
    try {
      const config = getAuthConfig(getState);
      const response = await axios.put(
        `${API_URL}/${leadId}/transfer`,
        { userId },
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to transfer lead'
      );
    }
  }
);

const initialState = {
  leads: [],
  currentLead: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  message: '',
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  },
};

const leadsSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    resetLeads: (state) => {
      state.status = 'idle';
      state.error = null;
      state.message = '';
    },
    clearCurrentLead: (state) => {
      state.currentLead = null;
    },
    setCurrentLead: (state, action) => {
      state.currentLead = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Leads
    builder
      .addCase(fetchLeads.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.leads = action.payload;
        state.error = null;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Fetch Lead by ID
      .addCase(fetchLeadById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchLeadById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentLead = action.payload;
        state.error = null;
      })
      .addCase(fetchLeadById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Create Lead
      .addCase(createLead.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createLead.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.leads.unshift(action.payload);
        state.message = 'Lead created successfully';
        state.error = null;
      })
      .addCase(createLead.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Update Lead
      .addCase(updateLead.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateLead.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.leads.findIndex(
          (lead) => lead.id === action.payload.id
        );
        if (index !== -1) {
          state.leads[index] = action.payload;
        }
        if (state.currentLead?.id === action.payload.id) {
          state.currentLead = action.payload;
        }
        state.message = 'Lead updated successfully';
        state.error = null;
      })
      .addCase(updateLead.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Delete Lead
      .addCase(deleteLead.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteLead.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.leads = state.leads.filter((lead) => lead.id !== action.payload);
        if (state.currentLead?.id === action.payload) {
          state.currentLead = null;
        }
        state.message = 'Lead deleted successfully';
        state.error = null;
      })
      .addCase(deleteLead.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Transfer Lead
      .addCase(transferLead.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(transferLead.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.leads.findIndex(
          (lead) => lead.id === action.payload.id
        );
        if (index !== -1) {
          state.leads[index] = action.payload;
        }
        if (state.currentLead?.id === action.payload.id) {
          state.currentLead = action.payload;
        }
        state.message = 'Lead transferred successfully';
        state.error = null;
      })
      .addCase(transferLead.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { resetLeads, clearCurrentLead, setCurrentLead } = leadsSlice.actions;

// Selectors
export const selectAllLeads = (state) => state.leads.leads;
export const selectLeadById = (state, leadId) =>
  state.leads.leads.find((lead) => lead.id === leadId);
export const selectCurrentLead = (state) => state.leads.currentLead;
export const selectLeadsStatus = (state) => state.leads.status;
export const selectLeadsError = (state) => state.leads.error;
export const selectLeadsMessage = (state) => state.leads.message;
export const selectLeadsPagination = (state) => state.leads.pagination;

export default leadsSlice.reducer;