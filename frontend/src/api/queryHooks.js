import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import productService from './productService';
import transactionService from './transactionService';

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