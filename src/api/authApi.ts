import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import { LoginResponse } from '../types';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, { employeeId: string; pin: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    changePin: builder.mutation<{ message: string }, { currentPin: string; newPin: string }>({
      query: (body) => ({ url: '/auth/change-pin', method: 'POST', body }),
    }),
    getProfile: builder.query<any, void>({
      query: () => '/auth/me',
    }),
    // OWASP A07: server-side token revocation — blacklists JWT in Redis
    logoutApi: builder.mutation<{ message: string }, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),
  }),
});

export const {
  useLoginMutation,
  useChangePinMutation,
  useGetProfileQuery,
  useLogoutApiMutation,
} = authApi;
