import axios from 'axios';
import { API_BASE_URL } from '../config';

// Create an axios instance with backend connection using environment variable
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  // Enable credentials for cross-origin requests if needed
  withCredentials: true,
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    // Add authentication token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Don't override Content-Type for FormData (it needs to include boundary)
    if (config.data instanceof FormData) {
      // Let axios set the correct content type with boundary
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle session expiration
    if (error.response && error.response.status === 401) {
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient; 