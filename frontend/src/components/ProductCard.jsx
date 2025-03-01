import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FiEdit, FiPlusCircle, FiMinusCircle, FiImage } from 'react-icons/fi';

/**
 * A card component for displaying product information
 * 
 * @param {Object} product - The product data to display
 * @param {Function} onStockChange - Optional callback for stock adjustment
 * @param {Boolean} showControls - Whether to show edit controls
 * @param {Boolean} showStockControls - Whether to show stock adjustment controls
 */
const ProductCard = ({ 
  product, 
  onStockChange, 
  showControls = true,
  showStockControls = false
}) => {
  const { t } = useTranslation();
  
  // Format price as currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fa-IR', {
      style: 'currency',
      currency: 'IRR',
      minimumFractionDigits: 0,
    }).format(price);
  };
  
  // Handle stock increment/decrement
  const handleStockChange = (amount) => {
    if (onStockChange) {
      const newStock = Math.max(0, product.stock_quantity + amount);
      onStockChange(product.id, newStock);
    }
  };
  
  // Get stock status color
  const getStockStatusColor = () => {
    if (product.stock_quantity > 10) {
      return 'bg-green-100 text-green-800';
    } else if (product.stock_quantity > 0) {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return 'bg-red-100 text-red-800';
    }
  };
  
  // Get image URL, accounting for relative paths
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If image already has a full URL or starts with a slash, use it directly
    if (imagePath.startsWith('http') || imagePath.startsWith('/')) {
      return imagePath;
    }
    
    // Otherwise, construct a URL relative to the API base URL
    return `/uploads/products/${imagePath}`;
  };
  
  // Get main image or first image from images array
  const getMainImage = () => {
    if (product.images && product.images.length > 0) {
      return getImageUrl(product.images[0]);
    }
    
    if (product.image) {
      return getImageUrl(product.image);
    }
    
    return null;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col">
      {/* Product Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h3 className="text-md font-medium text-gray-700 truncate" title={product.name}>
          {product.name}
        </h3>
        
        {showControls && (
          <Link 
            to={`/products/${product.id}`}
            className="text-indigo-600 hover:text-indigo-900"
          >
            <FiEdit size={18} />
          </Link>
        )}
      </div>
      
      {/* Product Image */}
      <div className="w-full h-48 bg-gray-100 flex justify-center items-center">
        {(product.image || (product.images && product.images.length > 0)) ? (
          <img 
            src={getMainImage()} 
            alt={product.name}
            className="w-full h-full object-contain p-2"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = `
                <div class="flex flex-col items-center justify-center w-full h-full">
                  <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p class="text-sm text-gray-500 mt-2">${t('products.imageError')}</p>
                </div>
              `;
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <FiImage className="w-10 h-10 text-gray-400" />
            <p className="text-sm text-gray-500 mt-2">{t('products.noImage')}</p>
          </div>
        )}
      </div>
      
      {/* Product Body */}
      <div className="p-4 flex-grow">
        {product.description && (
          <p className="text-sm text-gray-600 mb-3">{product.description}</p>
        )}
        
        <div className="flex justify-between items-center mt-2">
          <div className="text-lg font-semibold text-gray-900">
            {formatPrice(product.price)}
          </div>
          
          <div className="flex items-center">
            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStockStatusColor()}`}>
              {product.stock_quantity} {t('products.inStock')}
            </span>
          </div>
        </div>
        
        {/* Stock adjustment controls */}
        {showStockControls && onStockChange && (
          <div className="mt-3 flex items-center justify-end">
            <button
              onClick={() => handleStockChange(-1)}
              disabled={product.stock_quantity <= 0}
              className={`text-red-600 p-1 rounded-full hover:bg-red-50 ${product.stock_quantity <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FiMinusCircle size={20} />
            </button>
            
            <span className="mx-2 text-sm font-medium text-gray-700">
              {product.stock_quantity}
            </span>
            
            <button
              onClick={() => handleStockChange(1)}
              className="text-green-600 p-1 rounded-full hover:bg-green-50"
            >
              <FiPlusCircle size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard; 