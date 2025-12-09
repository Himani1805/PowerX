import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Custom base query function
// const baseQuery = fetchBaseQuery({
//   // 2. Point baseUrl directly to Backend Port 8000
//   baseUrl: 'http://localhost:8000/api/v1',

//   // 3. Use prepareHeaders to add token to Authorization header
//   prepareHeaders: (headers, { getState }) => {
//     // Get current token from Redux store
//     const token = getState().auth.token;

//     // If token exists, add it to Authorization header
//     if (token) {
//       headers.set('Authorization', `Bearer ${token}`);
//     }

//     return headers;
//   },
// });

// 1. & 5. Create Base API Slice using createApi and Named Export
export const apiSlice = createApi({
  reducerPath: "api", // This will be used as key in store.js
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/v1", // Your Backend URL
    prepareHeaders: (headers, { getState }) => {
      // Get token from Redux state
      const token = getState().auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Leads", "User", "Activities"], // Caching Tags
  endpoints: (builder) => ({}), // We will use injectEndpoints here later
});
