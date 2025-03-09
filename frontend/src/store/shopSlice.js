import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// Try to get shop data from localStorage if available
const getInitialShop = () => {
  try {
    console.log('Getting initial shop from localStorage');
    
    // First try to get shop data from the user in localStorage
    const userStr = localStorage.getItem('user');
    console.log('User string from localStorage:', userStr);
    
    if (userStr) {
      const user = JSON.parse(userStr);
      console.log('Parsed user from localStorage:', user);
      
      // If the response includes shop directly
      if (user.shop) {
        console.log('Found shop in user data:', user.shop);
        return user.shop;
      }
      
      // If the shop is embedded in a different way - some APIs might include shop directly on the user object
      if (user.name && user.id && user.address) {
        console.log('User object appears to be a shop itself:', user);
        return user;
      }
      
      // Log if we only have shop_id but no shop data
      if (user.shop_id) {
        console.log('Found shop_id but no shop data:', user.shop_id);
      }
    }
    
    console.log('No shop data found in localStorage');
    return null;
  } catch (error) {
    console.error('Error parsing shop from localStorage:', error);
    return null;
  }
};

const initialState = {
  currentShop: getInitialShop(),
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
  console.log('fetchShopData called');
  try {
    dispatch(setLoading(true));
    
    // Get user from auth state
    const { user } = getState().auth;
    console.log('User from Redux state:', user);
    
    if (!user || !user.shop_id) {
      console.log('No shop ID found in user object');
      throw new Error('No shop ID found');
    }
    
    console.log('Fetching shop data for ID:', user.shop_id);
    
    // Fetch shop data from API
    const response = await axios.get(`/api/shops/${user.shop_id}`);
    console.log('Shop API response:', response.data);
    
    // Update Redux state
    dispatch(setCurrentShop(response.data));
    console.log('Updated Redux state with shop data');
    
    // Save to localStorage by updating the user object
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        const updatedUser = {
          ...userData,
          shop: response.data
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        console.log('Updated user in localStorage with shop data:', updatedUser);
      }
    } catch (error) {
      console.error('Error updating shop in localStorage:', error);
    }
  } catch (error) {
    console.error('Error fetching shop:', error);
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

export default shopSlice.reducer; 