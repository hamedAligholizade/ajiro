import apiClient from './axiosConfig';

const statsService = {
  /**
   * Get dashboard overview stats
   * @returns {Promise} Response from API with dashboard stats
   */
  getDashboardStats: async () => {
    const response = await apiClient.get('/stats/dashboard');
    return response.data;
  },

  /**
   * Get sales analytics for a time period
   * @param {Object} params - Query parameters (period, start_date, end_date)
   * @returns {Promise} Response from API with sales data
   */
  getSalesAnalytics: async (params = {}) => {
    const response = await apiClient.get('/stats/sales', { params });
    return response.data;
  },

  /**
   * Get inventory stats and analytics
   * @returns {Promise} Response from API with inventory stats
   */
  getInventoryStats: async () => {
    const response = await apiClient.get('/stats/inventory');
    return response.data;
  }
};

export default statsService; 