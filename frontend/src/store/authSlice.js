import { createSlice } from '@reduxjs/toolkit';
import authService from '../api/authService';

// Get user from localStorage if available
const user = authService.getCurrentUser();

const initialState = {
  user: user,
  isAuthenticated: !!user,
  isLoading: false,
  error: null,
  isVerificationNeeded: false,
  verificationData: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
      state.isVerificationNeeded = false;
      state.verificationData = null;
    },
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    verificationNeeded: (state, action) => {
      state.isLoading = false;
      state.isVerificationNeeded = true;
      state.verificationData = action.payload;
    },
    verificationSuccess: (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.isVerificationNeeded = false;
      state.verificationData = null;
    },
    verificationFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      authService.logout();
    },
    clearError: (state) => {
      state.error = null;
    }
  },
});

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  verificationNeeded,
  verificationSuccess,
  verificationFailure,
  logout,
  clearError 
} = authSlice.actions;

export default authSlice.reducer; 