import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  currentShop: null,
  loading: false,
  error: null
};

const shopSlice = createSlice({
  name: 'shop',
  initialState,
  reducers: {
    setCurrentShop: (state, action) => {
      state.currentShop = action.payload;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearShop: (state) => {
      state.currentShop = null;
      state.error = null;
    }
  }
});

export const { setCurrentShop, setLoading, setError, clearShop } = shopSlice.actions;

// Thunk for fetching shop data
export const fetchShopData = () => async (dispatch, getState) => {
  try {
    dispatch(setLoading(true));
    
    // Get user from auth state
    const { user } = getState().auth;
    
    if (!user || !user.shop_id) {
      throw new Error('No shop ID found');
    }
    
    // Fetch shop data from API
    const response = await axios.get(`/api/shops/${user.shop_id}`);
    
    dispatch(setCurrentShop(response.data));
  } catch (error) {
    console.error('Error fetching shop:', error);
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

export default shopSlice.reducer; 