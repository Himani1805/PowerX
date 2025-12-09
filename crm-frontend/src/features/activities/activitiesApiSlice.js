import { apiSlice } from '../../app/api/apiSlice';

export const activitiesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Query: Get lead activities
    getActivities: builder.query({
      query: (leadId) => ({
        url: `/leads/${leadId}/activities`,
        method: 'GET',
      }),
      providesTags: ['Activities'],
    }),
    
    // Mutation: Create new activity
    createActivity: builder.mutation({
      query: ({ leadId, type, content }) => ({
        url: `/leads/${leadId}/activities`,
        method: 'POST',
        body: { type, content },
      }),
      // Refresh list when activity is created
      invalidatesTags: ['Activities'],
    }),
  }),
});

export const { 
  useGetActivitiesQuery, 
  useCreateActivityMutation 
} = activitiesApiSlice;