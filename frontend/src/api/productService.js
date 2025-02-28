import apiClient from './axiosConfig';

const productService = {
  /**
   * Get all products with pagination and search
   * @param {Object} params - Query parameters
   * @returns {Promise} Response from API
   */
  getProducts: async (params = {}) => {
    const response = await apiClient.get('/products', { params });
    return response.data;
  },

  /**
   * Get a single product by ID
   * @param {string|number} id - Product ID
   * @returns {Promise} Response from API
   */
  getProductById: async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @returns {Promise} Response from API
   */
  createProduct: async (productData) => {
    const response = await apiClient.post('/products', productData);
    return response.data;
  },

  /**
   * Update an existing product
   * @param {string|number} id - Product ID
   * @param {Object} productData - Product data to update
   * @returns {Promise} Response from API
   */
  updateProduct: async (id, productData) => {
    const response = await apiClient.put(`/products/${id}`, productData);
    return response.data;
  },

  /**
   * Delete a product
   * @param {string|number} id - Product ID
   * @returns {Promise} Response from API
   */
  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  }
};

export default productService; 