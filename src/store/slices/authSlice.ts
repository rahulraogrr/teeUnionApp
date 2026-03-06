import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthUser } from '../../types';

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: AuthUser }>,
    ) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
    },
    pinChanged: (state) => {
      if (state.user) {
        state.user.requiresPinChange = false;
      }
    },
  },
});

export const { setCredentials, logout, pinChanged } = authSlice.actions;
export default authSlice.reducer;
