import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { fetchShopData, setCurrentShop } from './shopSlice';
import authService from '../api/authService';
// Get user from localStorage if available
const user = authService.getCurrentUser();

const initialState = {
  user: user,
  token: null,
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

      // Log if shop data is present in the user object
      if (action.payload && action.payload.shop) {
        console.log('Shop data found in user object during setUser action');
      }
    },
    setToken: (state, action) => {
      state.token = action.payload;
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
      authService.logout();
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
    clearError: (state) => {
      state.error = null;
    }
  },
});

export const { setUser, setToken, setLoading, setError, logout, verificationNeeded, verificationSuccess, verificationFailure, clearError } = authSlice.actions;

// Thunk for handling login
export const login = (credentials) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    
    const response = await axios.post('/api/auth/login', credentials);
    const { user, token } = response.data;
    
    // Set token in axios defaults
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Store token in localStorage
    localStorage.setItem('token', token);
    
    // Update auth state
    dispatch(setToken(token));
    dispatch(setUser(user));
    
    // If user has shop data, update shop state directly
    if (user && user.shop) {
      console.log('Setting shop state from login response:', user.shop);
      dispatch(setCurrentShop(user.shop));
    }
    
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
  // Remove token from localStorage
  localStorage.removeItem('token');
  
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
    
    // Try to verify token and get user data from server
    try {
      const response = await axios.get('/api/auth/me');
      
      // Update auth state
      dispatch(setToken(token));
      dispatch(setUser(response.data));
      
      // If user has shop data, update shop state directly
      if (response.data && response.data.shop) {
        console.log('Setting shop state from auth check response:', response.data.shop);
        dispatch(setCurrentShop(response.data.shop));
      }
    } catch (apiError) {
      console.error('Error fetching updated user data:', apiError);
      console.log('Using cached user data from localStorage as fallback');
      
      // Fall back to using cached user data from localStorage
      const userData = authService.getCurrentUser();
      if (userData) {
        dispatch(setToken(token));
        dispatch(setUser(userData));
        
        // If user has shop data, update shop state directly
        if (userData.shop) {
          console.log('Setting shop state from localStorage fallback:', userData.shop);
          dispatch(setCurrentShop(userData.shop));
        }
      } else {
        // If we can't get user data, we need to clear the auth state
        throw new Error('No cached user data available');
      }
    }
    
    return true;
  } catch (error) {
    console.error('Auth check error:', error);
    dispatch(logoutUser());
    return false;
  }
};

export default authSlice.reducer; 