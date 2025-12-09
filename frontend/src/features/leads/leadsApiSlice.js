import { apiSlice } from '../../app/api/apiSlice'; // Import Base API Slice

// Extend apiSlice to define endpoints
export const leadsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 'getLeads' query endpoint
    getLeads: builder.query({
      query: (params) => ({
        url: '/leads',
        method: 'GET',
        params: params, // Pass query params (e.g., { search: '...' })
      }),
      // ✅ FIX: Safe Tag Generation
      providesTags: (result) => {
        if (result && result.data) {
          const leads = result.data.leads || result.data;
          if (Array.isArray(leads)) {
            return [
              ...leads.map(({ id }) => ({ type: 'Leads', id })),
              { type: 'Leads', id: 'LIST' },
            ];
          }
        }
        return [{ type: 'Leads', id: 'LIST' }];
      },
    }),
    getDashboardStatus: builder.query({
        query: () => '/dashboard/status',
        providesTags: ['Leads'], // Invalidate when leads change
    }),

    // 'getLeadById' query endpoint
    getLeadById: builder.query({
      query: (id) => `/leads/${id}`,
      providesTags: (result, error, id) => [{ type: 'Leads', id }],
    }),

    // 'createLead' mutation endpoint
    createLead: builder.mutation({
      query: (leadData) => ({
        url: '/leads',
        method: 'POST',
        body: leadData,
      }),
      // Invalidate 'Leads' list when new lead is created
      invalidatesTags: [{ type: 'Leads', id: 'LIST' }],
      // Optimistic update: Add new entry to UI immediately
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled; // API response
          const created = (
            data?.data?.lead ??
            data?.lead ??
            data
          );
          if (!created) return;

          // Update getLeads cache
          dispatch(
            apiSlice.util.updateQueryData('getLeads', undefined, (draft) => {
              // Normalize draft to array path where leads reside
              if (Array.isArray(draft?.data?.leads)) {
                draft.data.leads.unshift(created);
              } else if (Array.isArray(draft?.leads)) {
                draft.leads.unshift(created);
              } else if (Array.isArray(draft?.data)) {
                draft.data.unshift(created);
              } else if (Array.isArray(draft)) {
                draft.unshift(created);
              }
            })
          );
        } catch (e) {
          // Ignore; invalidation will refetch as fallback
        }
      },
    }),

    // 'updateLead' mutation endpoint
    updateLead: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/leads/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Leads', id: arg.id }],
    }),

    // 'deleteLead' mutation endpoint
    deleteLead: builder.mutation({
      query: (id) => ({
        url: `/leads/${id}`,
        method: 'DELETE',
      }),
      // ✅ FIX: Invalidate both the specific item AND the list
      invalidatesTags: (result, error, id) => [
        { type: 'Leads', id }, 
        { type: 'Leads', id: 'LIST' }
      ],
    }),
  }),
});

// Export hooks
export const {
  useGetLeadsQuery,
  useGetLeadByIdQuery,
  useCreateLeadMutation,
  useUpdateLeadMutation,
  useDeleteLeadMutation,
  useGetDashboardStatusQuery
} = leadsApiSlice;