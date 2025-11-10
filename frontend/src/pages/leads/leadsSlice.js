import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Initial state
const initialState = {
  leads: [],
  currentLead: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  selectedLeads: [],
  history: {}, // Track changes by leadId
  lastUpdated: null, // For caching
  filters: {
    status: 'all',
    search: '',
  },
  pagination: {
    page: 1,
    pageSize: 10,
    totalItems: 0,
  },
};

// Async thunks
export const fetchLeads = createAsyncThunk(
  'leads/fetchLeads',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/leads/my-leads');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leads');
    }
  }
);

export const fetchLeadById = createAsyncThunk(
  'leads/fetchLeadById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/leads/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch lead');
    }
  }
);

export const createLead = createAsyncThunk(
  'leads/createLead',
  async (leadData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/leads', leadData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create lead');
    }
  }
);

export const updateLead = createAsyncThunk(
  'leads/updateLead',
  async ({ id, ...leadData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/leads/${id}`, leadData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update lead');
    }
  }
);

export const deleteLead = createAsyncThunk(
  'leads/deleteLead',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/leads/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete lead');
    }
  }
);

// Lead Status Update
export const updateLeadStatus = createAsyncThunk(
  'leads/updateStatus',
  async ({ leadId, status, note }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/leads/${leadId}/status`, { status, note });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update lead status');
    }
  }
);

// Assign Lead
export const assignLead = createAsyncThunk(
  'leads/assign',
  async ({ leadId, userId }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/leads/${leadId}/assign`, { userId });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to assign lead');
    }
  }
);

// Bulk Operations
export const bulkUpdateLeads = createAsyncThunk(
  'leads/bulkUpdate',
  async ({ leadIds, updateData }, { rejectWithValue }) => {
    try {
      const response = await api.patch('/api/leads/bulk-update', { leadIds, ...updateData });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Bulk update failed');
    }
  }
);

export const bulkDeleteLeads = createAsyncThunk(
  'leads/bulkDelete',
  async (leadIds, { rejectWithValue }) => {
    try {
      await api.delete('/api/leads/bulk-delete', { data: { leadIds } });
      return leadIds;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Bulk delete failed');
    }
  }
);


// Create the slice
const leadsSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page when filters change
    },
    resetCurrentLead: (state) => {
      state.currentLead = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all leads
    builder
      .addCase(fetchLeads.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.leads = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Fetch single lead
      .addCase(fetchLeadById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchLeadById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentLead = action.payload;
      })

      // Create lead
      .addCase(createLead.fulfilled, (state, action) => {
        state.leads.unshift(action.payload);
      })

      // Update lead
      .addCase(updateLead.fulfilled, (state, action) => {
        const index = state.leads.findIndex(lead => lead.id === action.payload.id);
        if (index !== -1) {
          state.leads[index] = action.payload;
        }
        if (state.currentLead?.id === action.payload.id) {
          state.currentLead = action.payload;
        }
      })

      // Delete lead
      .addCase(deleteLead.fulfilled, (state, action) => {
        state.leads = state.leads.filter(lead => lead.id !== action.payload);
         state.status = 'succeeded';
      });

      // Update Lead Status
    builder.addCase(updateLeadStatus.fulfilled, (state, action) => {
      const index = state.leads.findIndex(lead => lead.id === action.payload.id);
      if (index !== -1) {
        state.leads[index] = action.payload;
      }
    });
    
    // Assign Lead
    builder.addCase(assignLead.fulfilled, (state, action) => {
      const index = state.leads.findIndex(lead => lead.id === action.payload.id);
      if (index !== -1) {
        state.leads[index] = action.payload;
      }
    });
    
    // Bulk Update
    builder.addCase(bulkUpdateLeads.fulfilled, (state, action) => {
      action.payload.updatedLeads.forEach(updatedLead => {
        const index = state.leads.findIndex(lead => lead.id === updatedLead.id);
        if (index !== -1) {
          state.leads[index] = updatedLead;
        }
      });
    });
    
    // Bulk Delete
    builder.addCase(bulkDeleteLeads.fulfilled, (state, action) => {
      state.leads = state.leads.filter(lead => !action.payload.includes(lead.id));
      state.selectedLeads = [];
    });
  },
});

// Export actions
export const { setFilters, resetCurrentLead } = leadsSlice.actions;

// Selectors
export const selectAllLeads = (state) => state.leads.leads;
export const selectCurrentLead = (state) => state.leads.currentLead;
export const selectLeadById = (state, leadId) => 
  state.leads.leads.find(lead => lead.id === leadId) || null;
export const selectLeadsStatus = (state) => state.leads.status;
export const selectLeadsError = (state) => state.leads.error;
export const selectLeadsFilters = (state) => state.leads.filters;
export const selectLeadsPagination = (state) => state.leads.pagination;
export const { selectLead, clearSelectedLeads } = leadsSlice.actions;

export default leadsSlice.reducer;