import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  FiPlus, 
  FiTrash2, 
  FiSearch, 
  FiX, 
  FiSave,
  FiShoppingCart,
  FiImage
} from 'react-icons/fi';
import { useProducts, useCreateTransaction } from '../api/queryHooks';
import { getFullImageUrl } from '../config';

const CreateTransaction = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // State for transaction
  const [items, setItems] = useState([]);
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Calculate total
  const totalAmount = items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  
  // Query products for selection
  const { 
    data: productData, 
    isLoading: productsLoading,
  } = useProducts({ 
    search: searchTerm,
    limit: 100, // Get more products at once for selection
  });
  
  // Transaction mutation
  const createTransaction = useCreateTransaction();
  
  // Handle adding a product to the transaction
  const addProductToTransaction = (product) => {
    // Check if product is already in the transaction
    const existingIndex = items.findIndex(item => item.product_id === product.id);
    
    if (existingIndex >= 0) {
      // Update quantity if already in transaction
      const updatedItems = [...items];
      updatedItems[existingIndex].quantity += 1;
      setItems(updatedItems);
    } else {
      // Add new item with image data
      setItems([
        ...items,
        {
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          stock_quantity: product.stock_quantity,
          image: product.image || null,
          images: product.images || null,
        }
      ]);
    }
    
    // Close product selector after adding
    setShowProductSelector(false);
    setSearchTerm('');
  };
  
  // Handle removing a product from transaction
  const removeProductFromTransaction = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };
  
  // Handle changing product quantity
  const updateProductQuantity = (index, quantity) => {
    if (quantity <= 0) {
      return removeProductFromTransaction(index);
    }
    
    const item = items[index];
    
    // Don't allow quantity to exceed available stock
    if (quantity > item.stock_quantity) {
      setError(t('transactions.insufficientStock', { name: item.name }));
      return;
    }
    
    const updatedItems = [...items];
    updatedItems[index].quantity = quantity;
    setItems(updatedItems);
    
    // Clear error if there was one
    if (error) setError('');
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate items
    if (items.length === 0) {
      setError(t('transactions.noItems'));
      return;
    }
    
    // Prepare transaction data
    const transactionData = {
      items: items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
      total_amount: totalAmount,
      customer_phone: customerPhone,
      notes,
    };
    
    try {
      setIsSubmitting(true);
      setError('');
      
      await createTransaction.mutateAsync(transactionData);
      
      // Navigate to transactions list on success
      navigate('/transactions');
    } catch (error) {
      console.error('Transaction error:', error);
      setError(error.response?.data?.message || t('transactions.error'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Format price as currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fa-IR', {
      style: 'currency',
      currency: 'IRR',
      minimumFractionDigits: 0,
    }).format(price);
  };
  
  // Get image URL - updated to use the backend-provided URLs directly
  const getImageUrl = (imagePath) => {
    // Return the path as-is since backend now provides full URLs
    return imagePath || null;
  };
  
  // Get product image URL directly
  const getProductImage = (product) => {
    if (!product) return null;
    
    // Simply return the image URL as-is, since it's already a full URL from the backend
    if (product.image) {
      return product.image;
    }
    
    // Or the first additional image
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0];
    }
    
    return null;
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('transactions.newSale')}
        </h1>
      </div>
      
      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product list and form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            {/* Add product button */}
            <div className="mb-6">
              <button
                type="button"
                onClick={() => setShowProductSelector(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <FiPlus className="mr-2" />
                {t('transactions.addProduct')}
              </button>
            </div>
            
            {/* Products in transaction */}
            {items.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('products.name')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('products.price')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('transactions.quantity')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('transactions.subtotal')}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('common.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div className="flex items-center">
                            {/* Product image */}
                            <div className="h-10 w-10 bg-gray-100 rounded-md flex-shrink-0 mr-3 overflow-hidden">
                              {getProductImage(item) ? (
                                <img 
                                  src={getProductImage(item)}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    // Use data URI instead of placeholder service
                                    e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AArial%2C%20Helvetica%2C%20sans-serif%3Bfont-size%3A14pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22%23eee%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20id%3D%22holder_text%22%20x%3D%2220%22%20y%3D%2256.5%22%3ENo Image%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fsvg%3E';
                                  }}
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <FiImage className="text-gray-400" />
                                </div>
                              )}
                            </div>
                            {/* Product name */}
                            <span>{item.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatPrice(item.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center w-24">
                            <button
                              type="button"
                              onClick={() => updateProductQuantity(index, item.quantity - 1)}
                              className="text-gray-500 hover:text-gray-600 rounded-full p-1 focus:outline-none"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <input
                              type="number"
                              min="1"
                              max={item.stock_quantity}
                              value={item.quantity}
                              onChange={(e) => updateProductQuantity(index, parseInt(e.target.value) || 0)}
                              className="w-12 text-center mx-1 border-gray-200 focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => updateProductQuantity(index, item.quantity + 1)}
                              className="text-gray-500 hover:text-gray-600 rounded-full p-1 focus:outline-none"
                              disabled={item.quantity >= item.stock_quantity}
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatPrice(item.price * item.quantity)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            type="button"
                            onClick={() => removeProductFromTransaction(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-md border border-gray-200">
                <FiShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  {t('transactions.noItemsYet')}
                </p>
                <button
                  type="button"
                  onClick={() => setShowProductSelector(true)}
                  className="mt-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <FiPlus className="mr-2" />
                  {t('transactions.addProduct')}
                </button>
              </div>
            )}
            
            {/* Product selector modal */}
            {showProductSelector && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-auto">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-medium text-gray-900">
                      {t('transactions.selectProduct')}
                    </h3>
                    <button 
                      onClick={() => {
                        setShowProductSelector(false);
                        setSearchTerm('');
                      }}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <FiX size={20} />
                    </button>
                  </div>
                  
                  {/* Search */}
                  <div className="p-4 border-b">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={t('products.search')}
                        className="w-full px-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      {searchTerm && (
                        <button
                          type="button"
                          onClick={() => setSearchTerm('')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <FiX size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Product list */}
                  <div className="max-h-96 overflow-y-auto p-4">
                    {productsLoading ? (
                      <div className="py-6 text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-500">{t('common.loading')}</p>
                      </div>
                    ) : productData?.products?.length ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {productData.products.map(product => (
                          <div 
                            key={product.id}
                            onClick={() => {
                              if (product.stock_quantity > 0) {
                                addProductToTransaction(product);
                              }
                            }}
                            className={`border rounded-md p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors ${
                              product.stock_quantity <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <div className="flex items-center">
                              {/* Product image */}
                              <div className="h-12 w-12 bg-gray-100 rounded-md flex-shrink-0 mr-3 overflow-hidden">
                                {getProductImage(product) ? (
                                  <img 
                                    src={getProductImage(product)}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      // Use data URI instead of placeholder service
                                      e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AArial%2C%20Helvetica%2C%20sans-serif%3Bfont-size%3A14pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22%23eee%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20id%3D%22holder_text%22%20x%3D%2220%22%20y%3D%2256.5%22%3ENo Image%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fsvg%3E';
                                    }}
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center">
                                    <FiImage className="text-gray-400" />
                                  </div>
                                )}
                              </div>
                              {/* Product info */}
                              <div>
                                <div className="font-medium text-gray-900">{product.name}</div>
                                <div className="text-sm text-gray-500">
                                  {formatPrice(product.price)} · {product.stock_quantity} {t('products.inStock')}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              disabled={product.stock_quantity <= 0}
                              className={`rounded-full p-1 ${
                                product.stock_quantity > 0 
                                  ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' 
                                  : 'text-gray-400 bg-gray-100'
                              }`}
                            >
                              <FiPlus size={20} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-gray-500">
                        {searchTerm 
                          ? t('products.noSearchResults') 
                          : t('products.noProductsYet')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Transaction summary and checkout */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {t('transactions.summary')}
            </h2>
            
            {/* Customer information */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="customerPhone">
                {t('transactions.customerPhone')}
              </label>
              <input
                id="customerPhone"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="09xxxxxxxxx"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="notes">
                {t('transactions.notes')}
              </label>
              <textarea
                id="notes"
                rows="3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              ></textarea>
            </div>
            
            {/* Summary details */}
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">{t('transactions.items')}:</span>
                <span className="text-gray-900 font-medium">{items.length}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">{t('transactions.totalQuantity')}:</span>
                <span className="text-gray-900 font-medium">
                  {items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              <div className="flex justify-between py-2 text-lg font-bold">
                <span className="text-gray-800">{t('transactions.total')}:</span>
                <span className="text-indigo-600">{formatPrice(totalAmount)}</span>
              </div>
            </div>
            
            {/* Checkout button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || items.length === 0}
              className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isSubmitting || items.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('transactions.processing')}
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <FiShoppingCart className="mr-2" />
                  {t('transactions.completeSale')}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTransaction; 