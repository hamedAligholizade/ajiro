import { useTranslation } from 'react-i18next';
import ProductCard from './ProductCard';
import { FiPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';

/**
 * A grid component for displaying multiple products
 * 
 * @param {Array} products - Array of product data
 * @param {Function} onStockChange - Optional callback for stock adjustment
 * @param {Boolean} showControls - Whether to show edit controls
 * @param {Boolean} showStockControls - Whether to show stock adjustment controls
 * @param {Boolean} isLoading - Whether data is being loaded
 * @param {Object} error - Error object if loading failed
 */
const ProductGrid = ({ 
  products = [],
  onStockChange,
  showControls = true,
  showStockControls = false,
  isLoading = false,
  error = null
}) => {
  const { t } = useTranslation();
  
  // Loading state
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">{t('common.loading')}</p>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <p className="mb-2">{t('common.error')}</p>
        <p>{error.message}</p>
      </div>
    );
  }
  
  // Empty state
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">{t('products.noProductsYet')}</p>
        <Link
          to="/products/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <FiPlus className="mr-2" />
          {t('products.add')}
        </Link>
      </div>
    );
  }
  
  // Grid of products
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onStockChange={onStockChange}
          showControls={showControls}
          showStockControls={showStockControls}
        />
      ))}
    </div>
  );
};

export default ProductGrid; 