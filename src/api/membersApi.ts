import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import { Member } from '../types';

export const membersApi = createApi({
  reducerPath: 'membersApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Member'],
  endpoints: (builder) => ({
    getMyProfile: builder.query<Member, void>({
      query: () => '/members/me',
      providesTags: ['Member'],
    }),
    updateProfile: builder.mutation<Member, Partial<Member>>({
      query: (body) => ({ url: '/members/me', method: 'PATCH', body }),
      invalidatesTags: ['Member'],
    }),
    getTelegramLinkToken: builder.query<{ token: string }, void>({
      query: () => '/telegram/link-token',
    }),
    getTelegramStatus: builder.query<{ linked: boolean; username?: string }, void>({
      query: () => '/telegram/status',
      providesTags: ['Member'],
    }),
    unlinkTelegram: builder.mutation<{ message: string }, void>({
      query: () => ({ url: '/telegram/unlink', method: 'DELETE' }),
      invalidatesTags: ['Member'],
    }),
    registerPushToken: builder.mutation<{ ok: boolean }, { token: string; platform: 'IOS' | 'ANDROID' }>({
      query: (body) => ({ url: '/push-tokens', method: 'POST', body }),
    }),
  }),
});

export const {
  useGetMyProfileQuery,
  useUpdateProfileMutation,
  useGetTelegramLinkTokenQuery,
  useGetTelegramStatusQuery,
  useUnlinkTelegramMutation,
  useRegisterPushTokenMutation,
} = membersApi;
