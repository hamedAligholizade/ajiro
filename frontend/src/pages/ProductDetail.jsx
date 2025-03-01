import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useProduct, useCreateProduct, useUpdateProduct } from '../api/queryHooks';
import { FiArrowLeft, FiTrash2 } from 'react-icons/fi';
import ProductForm from '../components/ProductForm';
import ImageGallery from '../components/ImageGallery';

const ProductDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isNewProduct = id === 'new';
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch product data if editing
  const { 
    data: productData, 
    isLoading, 
    error: fetchError 
  } = useProduct(isNewProduct ? null : id, {
    enabled: !isNewProduct
  });
  
  // Mutations
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  
  // Handle form submission
  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError('');
    
    try {
      if (isNewProduct) {
        await createProduct.mutateAsync(formData);
      } else {
        await updateProduct.mutateAsync({ id, data: formData });
      }
      
      // Navigate back to products list on success
      navigate('/products');
    } catch (err) {
      console.error('Product save error:', err);
      setError(err.message || t('products.saveError'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get image URLs for the gallery
  const getProductImages = () => {
    if (!productData?.product) return { mainImage: '', additionalImages: [] };
    
    const product = productData.product;
    
    const mainImage = product.image 
      ? (product.image.startsWith('http') || product.image.startsWith('/') 
        ? product.image 
        : `/uploads/products/${product.image}`)
      : '';
      
    const additionalImages = Array.isArray(product.images) 
      ? product.images.map(img => {
          if (img.startsWith('http') || img.startsWith('/')) {
            return img;
          }
          return `/uploads/products/${img}`;
        })
      : [];
      
    return { mainImage, additionalImages };
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/products')}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNewProduct ? t('products.addNew') : t('products.edit')}
          </h1>
        </div>
        
        {!isNewProduct && (
          <button
            onClick={() => {
              if (window.confirm(t('products.confirmDelete'))) {
                navigate(`/products?delete=${id}`);
              }
            }}
            className="text-red-600 hover:text-red-800 flex items-center"
          >
            <FiTrash2 className="mr-2" />
            {t('common.delete')}
          </button>
        )}
      </div>
      
      {/* Main content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">{t('common.loading')}</p>
          </div>
        ) : fetchError && !isNewProduct ? (
          <div className="text-center py-8 text-red-500">
            {t('products.fetchError')}: {fetchError.message}
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            {/* Display image gallery for existing products */}
            {!isNewProduct && productData?.product && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">{t('products.images')}</h2>
                <div className="max-w-xl mx-auto">
                  <ImageGallery 
                    mainImage={getProductImages().mainImage}
                    images={getProductImages().additionalImages}
                    altText={productData.product.name}
                  />
                </div>
              </div>
            )}
            
            <ProductForm
              initialData={productData?.product}
              onSubmit={handleSubmit}
              onCancel={() => navigate('/products')}
              isSubmitting={isSubmitting}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ProductDetail; 