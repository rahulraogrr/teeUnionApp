import { fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { getToken, clearAllCredentials } from '../utils/storage';
import { logout } from '../store/slices/authSlice';

import { Platform } from 'react-native';

const DEV_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const PROD_URL = 'https://tee-union-api-production.up.railway.app/api/v1';

// Set USE_LOCAL_API=true only when running a local backend
const USE_LOCAL_API = false;
const BASE_URL = USE_LOCAL_API && __DEV__
  ? `http://${DEV_HOST}:3000/api/v1`
  : PROD_URL;

// prepareHeaders supports async — reads JWT from Keychain (OWASP M2 fix)
const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: async (headers) => {
    const token = await getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Auto-logout on 401 — clears Keychain + MMKV session
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error?.status === 401) {
    await clearAllCredentials();
    api.dispatch(logout());
  }
  return result;
};
