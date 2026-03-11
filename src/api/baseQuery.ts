import { fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { tokenStorage } from '../utils/storage';
import { logout } from '../store/slices/authSlice';

import { Platform } from 'react-native';

const DEV_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const BASE_URL = __DEV__
  ? `http://${DEV_HOST}:3000/api/v1` // Android emulator or iOS simulator
  : 'https://tee-union-api-production.up.railway.app/api/v1'; // Production URL

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers) => {
    const token = tokenStorage.getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Auto-logout on 401
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error?.status === 401) {
    tokenStorage.clearAll();
    api.dispatch(logout());
  }
  return result;
};
