import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiX } from 'react-icons/fi';

/**
 * Modal for adjusting product stock
 * 
 * @param {Object} product - The product being adjusted
 * @param {Function} onClose - Function to close the modal
 * @param {Function} onSubmit - Function to submit the adjustment
 * @param {Boolean} isOpen - Whether the modal is open
 */
const StockAdjustmentModal = ({ product, onClose, onSubmit, isOpen }) => {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(product?.stock_quantity || 0);
  const [adjustment, setAdjustment] = useState(0);
  const [adjustmentType, setAdjustmentType] = useState('add'); // 'add' or 'set'
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!isOpen || !product) {
    return null;
  }
  
  // Handle quantity change
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    
    if (adjustmentType === 'add') {
      setAdjustment(value);
      setQuantity(product.stock_quantity + value);
    } else {
      setQuantity(value);
      setAdjustment(value - product.stock_quantity);
    }
  };
  
  // Handle adjustment type change
  const handleTypeChange = (type) => {
    setAdjustmentType(type);
    
    if (type === 'add') {
      setAdjustment(quantity - product.stock_quantity);
      // Quantity stays the same
    } else {
      setQuantity(product.stock_quantity + adjustment);
      // Adjustment stays the same
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        productId: product.id,
        adjustment,
        newQuantity: quantity,
        adjustmentType
      });
      
      onClose();
    } catch (error) {
      console.error('Stock adjustment error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">
            {t('products.adjustStock')}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <FiX size={20} />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-4">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">
              {t('products.product')}:
            </p>
            <p className="font-medium text-gray-900">{product.name}</p>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">
              {t('products.currentStock')}:
            </p>
            <p className="font-medium text-gray-900">{product.stock_quantity}</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            {/* Adjustment type selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('products.adjustmentType')}
              </label>
              <div className="flex">
                <button
                  type="button"
                  onClick={() => handleTypeChange('add')}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-l-md ${
                    adjustmentType === 'add'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('products.add')}
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('set')}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-r-md ${
                    adjustmentType === 'set'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('products.setTo')}
                </button>
              </div>
            </div>
            
            {/* Quantity input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="quantity">
                {adjustmentType === 'add' ? t('products.amount') : t('products.newQuantity')}
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                min={adjustmentType === 'set' ? 0 : undefined}
                value={adjustmentType === 'add' ? adjustment : quantity}
                onChange={handleQuantityChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            {/* Result preview */}
            <div className="p-3 bg-gray-50 rounded-md mb-4">
              <p className="text-sm text-gray-600">
                {t('products.newStockWillBe')}:
              </p>
              <p className="font-medium text-gray-900">
                {quantity}
              </p>
            </div>
            
            {/* Submit button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || adjustment === 0}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  (isSubmitting || adjustment === 0) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? t('common.saving') : t('common.save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StockAdjustmentModal; 