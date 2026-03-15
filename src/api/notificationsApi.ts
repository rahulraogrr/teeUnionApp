import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import { AppNotification, PaginatedResponse } from '../types';

export const notificationsApi = createApi({
  reducerPath: 'notificationsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Notification'],
  keepUnusedDataFor: 120, // 2 minutes — notifications are more time-sensitive
  endpoints: (builder) => ({
    getNotifications: builder.query<PaginatedResponse<AppNotification>, { page?: number; limit?: number }>({
      query: (params) => ({ url: '/notifications', params }),
      providesTags: ['Notification'],
    }),
    getUnreadCount: builder.query<{ count: number }, void>({
      query: () => '/notifications/unread-count',
      providesTags: ['Notification'],
    }),
    markAllRead: builder.mutation<{ ok: boolean }, void>({
      query: () => ({ url: '/notifications/read-all', method: 'PATCH' }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAllReadMutation,
} = notificationsApi;
