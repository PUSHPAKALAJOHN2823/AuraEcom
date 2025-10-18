// redux/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token') || null,
    isLoading: false, // Changed: Start with false, will be set true when checking auth
    isInitialized: false, // New: Track if we've checked for existing session
  },
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isInitialized = true;
      // Removed: Don't set isLoading here, let setLoading handle it
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isLoading = false;
      localStorage.removeItem('token');
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setInitialized: (state, action) => {
      state.isInitialized = action.payload;
    },
  },
});

export const { setCredentials, logout, setLoading, setInitialized } = authSlice.actions;
export default authSlice.reducer;