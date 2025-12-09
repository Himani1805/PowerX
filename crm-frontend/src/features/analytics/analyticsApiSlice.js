import { apiSlice } from '../../app/api/apiSlice';

export const analyticsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get statistics based on lead status
    getLeadStatusStats: builder.query({
      query: () => '/dashboard/status',
      // Analytics data may need to be refreshed less frequently, or you can add tags
      keepUnusedDataFor: 60, // Keep cache for 60 seconds
    }),
    // Get statistics based on lead owner
    getLeadOwnerStats: builder.query({
      query: () => '/dashboard/owner',
      keepUnusedDataFor: 60,
    }),
  }),
});

export const { 
  useGetLeadStatusStatsQuery, 
  useGetLeadOwnerStatsQuery 
} = analyticsApiSlice;