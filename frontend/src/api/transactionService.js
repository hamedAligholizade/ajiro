import apiClient from './axiosConfig';

const transactionService = {
  /**
   * Get all transactions with pagination and date filtering
   * @param {Object} params - Query parameters
   * @returns {Promise} Response from API
   */
  getTransactions: async (params = {}) => {
    const response = await apiClient.get('/transactions', { params });
    return response.data;
  },

  /**
   * Get a single transaction by ID
   * @param {string|number} id - Transaction ID
   * @returns {Promise} Response from API
   */
  getTransactionById: async (id) => {
    const response = await apiClient.get(`/transactions/${id}`);
    return response.data;
  },

  /**
   * Create a new transaction (record a sale)
   * @param {Object} transactionData - Transaction data including items
   * @returns {Promise} Response from API
   */
  createTransaction: async (transactionData) => {
    const response = await apiClient.post('/transactions', transactionData);
    return response.data;
  }
};

export default transactionService; 