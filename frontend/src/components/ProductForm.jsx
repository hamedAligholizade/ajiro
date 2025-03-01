import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FiSave, FiUpload, FiX, FiPlus } from 'react-icons/fi';

const ProductForm = ({ 
  initialData = {}, 
  onSubmit, 
  onCancel, 
  isSubmitting = false 
}) => {
  const { t } = useTranslation();
  const mainFileInputRef = useRef(null);
  const additionalFileInputRef = useRef(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    description: initialData.description || '',
    price: initialData.price || '',
    stock_quantity: initialData.stock_quantity || '',
    image: initialData.image || '',
  });
  
  const [errors, setErrors] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [mainImageFile, setMainImageFile] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(initialData.image || '');
  
  // State for additional images
  const [additionalImages, setAdditionalImages] = useState([]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState([]);
  
  // Update form when initialData changes, but only for edit mode (when there's actual data)
  useEffect(() => {
    // Only update if we have real data and haven't initialized yet, or when editing an existing product
    if (initialData && initialData.id && (!isInitialized || Object.keys(initialData).length > 0)) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price || '',
        stock_quantity: initialData.stock_quantity || '',
        image: initialData.image || '',
      });
      
      setMainImagePreview(initialData.image || '');
      
      // Initialize additional images from the existing product
      if (initialData.images && Array.isArray(initialData.images)) {
        const initialPreviews = initialData.images.map(img => {
          // Convert to full path if needed
          if (img.startsWith('http') || img.startsWith('/')) {
            return img;
          }
          return `/uploads/products/${img}`;
        });
        
        setAdditionalImagePreviews(initialPreviews);
      }
      
      setIsInitialized(true);
    }
  }, [initialData?.id]); // Only depend on the ID changing, not the entire object
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };
  
  // Validate image file
  const validateImageFile = (file) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return t('validation.invalidImageType');
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return t('validation.imageTooLarge');
    }
    
    return null; // No error
  };
  
  // Handle main image selection
  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const error = validateImageFile(file);
    if (error) {
      setErrors(prev => ({
        ...prev,
        image: error,
      }));
      return;
    }
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setMainImagePreview(previewUrl);
    setMainImageFile(file);
    setFormData(prev => ({ ...prev, image: file.name }));
    
    // Clear any existing error
    if (errors.image) {
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };
  
  // Handle additional images selection
  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Validate each file
    const newFiles = [];
    const newPreviews = [];
    
    for (const file of files) {
      const error = validateImageFile(file);
      if (error) {
        setErrors(prev => ({
          ...prev,
          additionalImages: error,
        }));
        continue;
      }
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      newPreviews.push(previewUrl);
      newFiles.push(file);
    }
    
    // Update state with new files
    setAdditionalImages(prev => [...prev, ...newFiles]);
    setAdditionalImagePreviews(prev => [...prev, ...newPreviews]);
    
    // Clear any existing error
    if (errors.additionalImages) {
      setErrors(prev => ({ ...prev, additionalImages: '' }));
    }
  };
  
  // Trigger main file input click
  const handleMainImageClick = () => {
    mainFileInputRef.current.click();
  };
  
  // Trigger additional file input click
  const handleAdditionalImagesClick = () => {
    additionalFileInputRef.current.click();
  };
  
  // Remove main image
  const handleRemoveMainImage = () => {
    setMainImagePreview('');
    setMainImageFile(null);
    setFormData(prev => ({ ...prev, image: '' }));
    
    // If we are editing a product and removing an existing image, add to removal list
    if (initialData.image && !mainImageFile) {
      setImagesToRemove(prev => [...prev, initialData.image]);
    }
    
    if (mainFileInputRef.current) {
      mainFileInputRef.current.value = '';
    }
  };
  
  // Remove additional image
  const handleRemoveAdditionalImage = (index) => {
    // Get the image being removed
    const imageUrl = additionalImagePreviews[index];
    
    // If it's an existing image (from initialData), add to removal list
    if (initialData?.images && initialData.images[index]) {
      setImagesToRemove(prev => [...prev, initialData.images[index]]);
    }
    
    // Update state
    setAdditionalImagePreviews(prev => prev.filter((_, i) => i !== index));
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t('validation.required');
    }
    
    if (!formData.price) {
      newErrors.price = t('validation.required');
    } else if (isNaN(formData.price) || parseFloat(formData.price) < 0) {
      newErrors.price = t('validation.invalidPrice');
    }
    
    if (formData.stock_quantity && (isNaN(formData.stock_quantity) || parseInt(formData.stock_quantity) < 0)) {
      newErrors.stock_quantity = t('validation.invalidStock');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Prepare data for submission
    const productData = new FormData();
    productData.append('name', formData.name);
    productData.append('description', formData.description);
    productData.append('price', parseFloat(formData.price));
    productData.append('stock_quantity', formData.stock_quantity ? parseInt(formData.stock_quantity) : 0);
    
    // Append main image file if there's a new one
    if (mainImageFile) {
      productData.append('image', mainImageFile);
    } else if (formData.image) {
      // Keep existing main image
      productData.append('image', formData.image);
    }
    
    // Append additional image files
    additionalImages.forEach(file => {
      productData.append('additionalImages', file);
    });
    
    // Append list of images to remove
    if (imagesToRemove.length > 0) {
      productData.append('removeImages', JSON.stringify(imagesToRemove));
    }
    
    // Call parent submission handler
    onSubmit(productData);
  };
  
  // Utility function to get image URL for display
  const getImageUrl = (path) => {
    if (!path) return '';
    
    // If it's already a full URL or starts with a slash, use it as is
    if (path.startsWith('http') || path.startsWith('/')) {
      return path;
    }
    
    // Otherwise, create a URL using the backend's uploads path
    return `/uploads/products/${path}`;
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {errors.form && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errors.form}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
            {t('products.name')} *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>
        
        {/* Description */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
            {t('products.description')}
          </label>
          <textarea
            id="description"
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          ></textarea>
        </div>
        
        {/* Main Image Upload */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('products.mainImage')}
          </label>
          
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            {mainImagePreview ? (
              <div className="relative">
                <img 
                  src={mainImagePreview.startsWith('http') || mainImagePreview.startsWith('/') ? mainImagePreview : getImageUrl(mainImagePreview)} 
                  alt={formData.name || 'Product'} 
                  className="max-h-48 max-w-full rounded-md"
                />
                <button
                  type="button"
                  onClick={handleRemoveMainImage}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-md transform translate-x-1/2 -translate-y-1/2"
                >
                  <FiX size={16} />
                </button>
              </div>
            ) : (
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="main-file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                  >
                    <span onClick={handleMainImageClick}>{t('products.uploadImage')}</span>
                    <input
                      id="main-file-upload"
                      name="main-file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      ref={mainFileInputRef}
                      onChange={handleMainImageChange}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
              </div>
            )}
          </div>
          {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
        </div>
        
        {/* Additional Images */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('products.additionalImages')}
          </label>
          
          {/* Additional images gallery */}
          {additionalImagePreviews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
              {additionalImagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img 
                    src={preview.startsWith('http') || preview.startsWith('/') ? preview : getImageUrl(preview)} 
                    alt={`Product ${index + 1}`}
                    className="h-32 w-full object-cover rounded-md border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveAdditionalImage(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-md transform translate-x-1/2 -translate-y-1/2"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Add more images button */}
          <div 
            onClick={handleAdditionalImagesClick}
            className="mt-2 flex justify-center items-center px-6 py-4 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-gray-50"
          >
            <div className="text-center">
              <FiPlus className="mx-auto h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-600 mt-2">{t('products.addMoreImages')}</p>
            </div>
            <input
              type="file"
              className="sr-only"
              accept="image/*"
              multiple
              ref={additionalFileInputRef}
              onChange={handleAdditionalImagesChange}
            />
          </div>
          {errors.additionalImages && <p className="mt-1 text-sm text-red-600">{errors.additionalImages}</p>}
        </div>
        
        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="price">
            {t('products.price')} *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            className={`w-full px-3 py-2 border ${
              errors.price ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
          />
          {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
        </div>
        
        {/* Stock Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="stock_quantity">
            {t('products.stockQuantity')}
          </label>
          <input
            type="number"
            id="stock_quantity"
            name="stock_quantity"
            value={formData.stock_quantity}
            onChange={handleChange}
            min="0"
            step="1"
            className={`w-full px-3 py-2 border ${
              errors.stock_quantity ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
          />
          {errors.stock_quantity && <p className="mt-1 text-sm text-red-600">{errors.stock_quantity}</p>}
        </div>
      </div>
      
      {/* Form actions */}
      <div className="mt-8 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          <FiSave className="mr-2" />
          {isSubmitting ? t('common.saving') : t('common.save')}
        </button>
      </div>
    </form>
  );
};

export default ProductForm; 