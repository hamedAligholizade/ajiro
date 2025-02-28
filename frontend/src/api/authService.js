import apiClient from './axiosConfig';

const authService = {
  /**
   * Sign up a new user
   * @param {Object} userData - User data (email or mobile)
   * @returns {Promise} Response from API
   */
  signup: async (userData) => {
    const response = await apiClient.post('/auth/signup', userData);
    return response.data;
  },

  /**
   * Sign in a user
   * @param {Object} credentials - User credentials
   * @returns {Promise} Response from API with token
   */
  signin: async (credentials) => {
    const response = await apiClient.post('/auth/signin', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  /**
   * Verify a code sent to phone or email
   * @param {Object} verificationData - Verification data
   * @returns {Promise} Response from API
   */
  verify: async (verificationData) => {
    const response = await apiClient.post('/auth/verify', verificationData);
    return response.data;
  },

  /**
   * Resend a verification code
   * @param {Object} data - Contains mobile or email to resend to
   * @returns {Promise} Response from API
   */
  resendCode: async (data) => {
    const response = await apiClient.post('/auth/resend-code', data);
    return response.data;
  },

  /**
   * Logout the current user
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Get the current logged in user
   * @returns {Object|null} Current user or null
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (error) {
      localStorage.removeItem('user');
      return null;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {Boolean} True if authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

export default authService; 