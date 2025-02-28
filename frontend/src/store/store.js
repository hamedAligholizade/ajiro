import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';

// Configure the Redux store
const store = configureStore({
  reducer: {
    auth: authReducer,
    // Add more reducers as needed
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export default store; 