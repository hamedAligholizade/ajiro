import apiClient from './axiosConfig';

const loyaltyService = {
  /**
   * Get loyalty configuration for a shop
   * @param {string|number} shopId - Shop ID
   * @returns {Promise} Response from API
   */
  getLoyaltyConfig: async (shopId) => {
    const response = await apiClient.get(`/shops/${shopId}/loyalty/config`);
    return response.data;
  },

  /**
   * Update loyalty configuration for a shop
   * @param {string|number} shopId - Shop ID
   * @param {Object} configData - Loyalty config data
   * @returns {Promise} Response from API
   */
  updateLoyaltyConfig: async (shopId, configData) => {
    const response = await apiClient.put(`/shops/${shopId}/loyalty/config`, configData);
    return response.data;
  },

  /**
   * Calculate points for a transaction (preview)
   * @param {string|number} shopId - Shop ID
   * @param {Object} transactionData - Transaction data to calculate points for
   * @returns {Promise} Response from API with calculated points
   */
  calculatePoints: async (shopId, transactionData) => {
    const response = await apiClient.post(`/shops/${shopId}/loyalty/calculate-points`, transactionData);
    return response.data;
  },

  /**
   * Process loyalty points for a completed transaction
   * @param {string|number} shopId - Shop ID
   * @param {string|number} transactionId - Transaction ID
   * @param {Object} data - Optional additional data
   * @returns {Promise} Response from API
   */
  processTransactionPoints: async (shopId, transactionId, data = {}) => {
    const response = await apiClient.post(`/shops/${shopId}/transactions/${transactionId}/process-points`, data);
    return response.data;
  }
};

export default loyaltyService; 