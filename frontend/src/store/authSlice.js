import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { fetchShopData } from './shopSlice';

// Get user from localStorage if available
const storedUser = localStorage.getItem('user');
const user = storedUser ? JSON.parse(storedUser) : null;

const initialState = {
  user: user,
  token: localStorage.getItem('token'),
  isAuthenticated: !!user,
  loading: false,
  error: null,
  isVerificationNeeded: false,
  verificationData: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    setToken: (state, action) => {
      state.token = action.payload;
      if (action.payload) {
        localStorage.setItem('token', action.payload);
      } else {
        localStorage.removeItem('token');
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    verificationNeeded: (state, action) => {
      state.loading = false;
      state.isVerificationNeeded = true;
      state.verificationData = action.payload;
    },
    verificationSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.isVerificationNeeded = false;
      state.verificationData = null;
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    verificationFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
});

export const { 
  setUser, 
  setToken, 
  setLoading, 
  setError, 
  logout, 
  verificationNeeded, 
  verificationSuccess, 
  verificationFailure, 
  clearError 
} = authSlice.actions;

// Thunk for handling login
export const login = (credentials) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    
    const response = await axios.post('/api/auth/login', credentials);
    const { user, token } = response.data;
    
    // Set token in axios defaults
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Update auth state
    dispatch(setToken(token));
    dispatch(setUser(user));
    
    // Fetch shop data
    dispatch(fetchShopData());
    
    return true;
  } catch (error) {
    console.error('Login error:', error);
    dispatch(setError(error.response?.data?.message || 'Login failed'));
    return false;
  } finally {
    dispatch(setLoading(false));
  }
};

// Thunk for handling logout
export const logoutUser = () => (dispatch) => {
  // Remove token from axios defaults
  delete axios.defaults.headers.common['Authorization'];
  
  // Clear auth state
  dispatch(logout());
};

// Thunk for checking auth status on app load
export const checkAuth = () => async (dispatch) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return false;
  }
  
  try {
    // Set token in axios defaults
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Verify token and get user data
    const response = await axios.get('/api/auth/me');
    
    // Update auth state
    dispatch(setToken(token));
    dispatch(setUser(response.data));
    
    // Fetch shop data
    dispatch(fetchShopData());
    
    return true;
  } catch (error) {
    console.error('Auth check error:', error);
    dispatch(logoutUser());
    return false;
  }
};

export default authSlice.reducer; 