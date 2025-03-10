import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import productService from './productService';
import transactionService from './transactionService';
import customerService from './customerService';
import loyaltyService from './loyaltyService';
import shopService from './shopService';
import statsService from './statsService';

// === Product Query Hooks ===

/**
 * Hook to fetch products with optional filtering and pagination
 */
export const useProducts = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productService.getProducts(params),
    ...options,
  });
};

/**
 * Hook to fetch a single product by ID
 */
export const useProduct = (id, options = {}) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProductById(id),
    enabled: !!id,
    ...options,
  });
};

/**
 * Hook to create a new product
 */
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (productData) => productService.createProduct(productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

/**
 * Hook to update an existing product
 */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => productService.updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
    },
  });
};

/**
 * Hook to delete a product
 */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

// === Transaction Query Hooks ===

/**
 * Hook to fetch transactions with optional filtering and pagination
 */
export const useTransactions = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => transactionService.getTransactions(params),
    ...options,
  });
};

/**
 * Hook to fetch a single transaction by ID
 */
export const useTransaction = (id, options = {}) => {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: () => transactionService.getTransactionById(id),
    enabled: !!id,
    ...options,
  });
};

/**
 * Hook to create a new transaction (record a sale)
 */
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (transactionData) => transactionService.createTransaction(transactionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      // Also invalidate products since stock quantities will change
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

// === Customer Query Hooks ===

/**
 * Hook to fetch customers for a shop with optional filtering and pagination
 */
export const useCustomers = (shopId, params = {}, options = {}) => {
  return useQuery({
    queryKey: ['customers', shopId, params],
    queryFn: () => customerService.getCustomers(shopId, params),
    enabled: !!shopId,
    ...options,
  });
};

/**
 * Hook to fetch a customer by mobile number
 */
export const useCustomerByMobile = (shopId, mobileNumber, options = {}) => {
  return useQuery({
    queryKey: ['customer', 'mobile', shopId, mobileNumber],
    queryFn: () => customerService.getCustomerByMobile(shopId, mobileNumber),
    enabled: !!shopId && !!mobileNumber,
    ...options,
  });
};

/**
 * Hook to create a new customer
 */
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ shopId, data }) => customerService.createCustomer(shopId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers', variables.shopId] });
    },
  });
};

/**
 * Hook to update a customer
 */
export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ shopId, customerId, data }) => customerService.updateCustomer(shopId, customerId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers', variables.shopId] });
      queryClient.invalidateQueries({ 
        queryKey: ['customer', 'mobile', variables.shopId],
        predicate: (query) => query.queryKey[3] === variables.data.mobileNumber
      });
    },
  });
};

/**
 * Hook to fetch customer loyalty details
 */
export const useCustomerLoyalty = (shopId, customerId, options = {}) => {
  return useQuery({
    queryKey: ['customer', 'loyalty', shopId, customerId],
    queryFn: () => customerService.getCustomerLoyalty(shopId, customerId),
    enabled: !!shopId && !!customerId,
    ...options,
  });
};

/**
 * Hook to adjust points for a customer
 */
export const useAdjustPoints = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ shopId, customerId, data }) => customerService.adjustPoints(shopId, customerId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer', 'loyalty', variables.shopId, variables.customerId] });
    },
  });
};

// === Loyalty Query Hooks ===

/**
 * Hook to fetch loyalty config for a shop
 */
export const useLoyaltyConfig = (shopId, options = {}) => {
  return useQuery({
    queryKey: ['loyalty', 'config', shopId],
    queryFn: () => loyaltyService.getLoyaltyConfig(shopId),
    enabled: !!shopId,
    ...options,
  });
};

/**
 * Hook to update loyalty config
 */
export const useUpdateLoyaltyConfig = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ shopId, data }) => loyaltyService.updateLoyaltyConfig(shopId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['loyalty', 'config', variables.shopId] });
    },
  });
};

/**
 * Hook to calculate points for a transaction (preview)
 */
export const useCalculatePoints = () => {
  return useMutation({
    mutationFn: ({ shopId, data }) => loyaltyService.calculatePoints(shopId, data),
  });
};

/**
 * Hook to process transaction points
 */
export const useProcessTransactionPoints = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ shopId, transactionId, data }) => loyaltyService.processTransactionPoints(shopId, transactionId, data),
    onSuccess: (_, variables) => {
      // Invalidate customer loyalty data - would need the customerId here
      // This is handled by the transaction service already
    },
  });
};

// === Shop Query Hooks ===

/**
 * Hook to fetch a shop by ID
 */
export const useShop = (id, options = {}) => {
  return useQuery({
    queryKey: ['shop', id],
    queryFn: () => shopService.getShopById(id),
    enabled: !!id,
    ...options,
  });
};

// === Stats Query Hooks ===

/**
 * Hook to fetch dashboard overview stats
 */
export const useDashboardStats = (options = {}) => {
  return useQuery({
    queryKey: ['stats', 'dashboard'],
    queryFn: () => statsService.getDashboardStats(),
    refetchOnWindowFocus: false,
    staleTime: 300000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch sales analytics
 */
export const useSalesAnalytics = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['stats', 'sales', params],
    queryFn: () => statsService.getSalesAnalytics(params),
    refetchOnWindowFocus: false,
    staleTime: 300000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch inventory stats
 */
export const useInventoryStats = (options = {}) => {
  return useQuery({
    queryKey: ['stats', 'inventory'],
    queryFn: () => statsService.getInventoryStats(),
    refetchOnWindowFocus: false,
    staleTime: 300000, // 5 minutes
    ...options,
  });
}; 