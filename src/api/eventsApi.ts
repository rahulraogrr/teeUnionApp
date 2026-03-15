import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import { PaginatedResponse, UnionEvent } from '../types';

export const eventsApi = createApi({
  reducerPath: 'eventsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Event'],
  keepUnusedDataFor: 600, // 10 minutes — events change infrequently
  endpoints: (builder) => ({
    getEvents: builder.query<PaginatedResponse<UnionEvent>, { page?: number; limit?: number }>({
      query: (params) => ({ url: '/events', params }),
      providesTags: ['Event'],
    }),
    getEventById: builder.query<UnionEvent, string>({
      query: (id) => `/events/${id}`,
    }),
  }),
});

export const { useGetEventsQuery, useGetEventByIdQuery } = eventsApi;
