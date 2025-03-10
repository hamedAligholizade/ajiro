import apiClient from './axiosConfig';

const customerService = {
  /**
   * Get all customers for a shop
   * @param {string|number} shopId - Shop ID
   * @param {Object} params - Query parameters for pagination and filtering
   * @returns {Promise} Response from API
   */
  getCustomers: async (shopId, params = {}) => {
    const response = await apiClient.get(`/shops/${shopId}/customers`, { params });
    return response.data;
  },

  /**
   * Get customer by mobile number
   * @param {string|number} shopId - Shop ID
   * @param {string} mobileNumber - Customer mobile number
   * @returns {Promise} Response from API
   */
  getCustomerByMobile: async (shopId, mobileNumber) => {
    const response = await apiClient.get(`/shops/${shopId}/customers/mobile/${mobileNumber}`);
    return response.data;
  },

  /**
   * Create a new customer
   * @param {string|number} shopId - Shop ID
   * @param {Object} customerData - Customer data
   * @returns {Promise} Response from API
   */
  createCustomer: async (shopId, customerData) => {
    const response = await apiClient.post(`/shops/${shopId}/customers`, customerData);
    return response.data;
  },

  /**
   * Update an existing customer
   * @param {string|number} shopId - Shop ID
   * @param {string|number} customerId - Customer ID
   * @param {Object} customerData - Updated customer data
   * @returns {Promise} Response from API
   */
  updateCustomer: async (shopId, customerId, customerData) => {
    const response = await apiClient.put(`/shops/${shopId}/customers/${customerId}`, customerData);
    return response.data;
  },

  /**
   * Get customer loyalty details
   * @param {string|number} shopId - Shop ID
   * @param {string|number} customerId - Customer ID
   * @returns {Promise} Response from API
   */
  getCustomerLoyalty: async (shopId, customerId) => {
    const response = await apiClient.get(`/shops/${shopId}/customers/${customerId}/loyalty`);
    return response.data;
  },

  /**
   * Adjust points for a customer (manual)
   * @param {string|number} shopId - Shop ID
   * @param {string|number} customerId - Customer ID
   * @param {Object} pointsData - Points adjustment data (amount, reason)
   * @returns {Promise} Response from API
   */
  adjustPoints: async (shopId, customerId, pointsData) => {
    const response = await apiClient.post(`/shops/${shopId}/customers/${customerId}/points`, pointsData);
    return response.data;
  }
};

export default customerService; 