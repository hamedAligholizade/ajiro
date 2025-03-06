import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import shopReducer from './shopSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    shop: shopReducer,
  },
});

export default store; 