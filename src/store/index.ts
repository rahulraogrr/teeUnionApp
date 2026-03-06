import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import { authApi } from '../api/authApi';
import { ticketsApi } from '../api/ticketsApi';
import { newsApi } from '../api/newsApi';
import { eventsApi } from '../api/eventsApi';
import { notificationsApi } from '../api/notificationsApi';
import { membersApi } from '../api/membersApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [ticketsApi.reducerPath]: ticketsApi.reducer,
    [newsApi.reducerPath]: newsApi.reducer,
    [eventsApi.reducerPath]: eventsApi.reducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer,
    [membersApi.reducerPath]: membersApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      ticketsApi.middleware,
      newsApi.middleware,
      eventsApi.middleware,
      notificationsApi.middleware,
      membersApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks — use these instead of plain useDispatch/useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
