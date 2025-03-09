import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import shopReducer from './shopSlice';
// Configure the Redux store
const store = configureStore({
  reducer: {
    auth: authReducer,
    shop: shopReducer,
    // Add more reducers as needed
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export default store; 