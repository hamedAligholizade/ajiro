import apiClient from './axiosConfig';

const shopService = {
  /**
   * Get shop by ID
   * @param {string|number} id - Shop ID
   * @returns {Promise} Response from API
   */
  getShopById: async (id) => {
    const response = await apiClient.get(`/shops/${id}`);
    return response.data;
  }
};

export default shopService; 