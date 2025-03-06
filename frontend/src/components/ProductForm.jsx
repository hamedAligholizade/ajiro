import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FiSave, FiUpload, FiX, FiPlus } from 'react-icons/fi';
import { getFullImageUrl } from '../config';

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
      
      // Initialize main image preview properly
      if (initialData.image) {
        // Use the utility function to get the full image URL
        setMainImagePreview(getFullImageUrl(initialData.image));
      } else {
        setMainImagePreview('');
      }
      
      // Reset file state when initializing
      setMainImageFile(null);
      setAdditionalImages([]);
      setImagesToRemove([]);
      
      // Initialize additional images from the existing product
      if (initialData.images && Array.isArray(initialData.images) && initialData.images.length > 0) {
        console.log('Initializing additional images:', initialData.images);
        // Make a deep copy to avoid references
        const initialPreviews = initialData.images.map(img => {
          // Handle null or undefined values
          if (!img) return null;
          
          // Convert to full path if needed
          if (typeof img === 'string') {
            return getFullImageUrl(img);
          }
          
          // If it's an object with a path property (adapt based on your API response)
          if (img.path) {
            return getFullImageUrl(img.path);
          }
          
          return img;
        }).filter(Boolean); // Remove any null values
        
        console.log('Initialized image previews:', initialPreviews);
        setAdditionalImagePreviews(initialPreviews);
      } else {
        setAdditionalImagePreviews([]);
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
      // Reset the file input to allow selecting the same file again
      if (mainFileInputRef.current) {
        mainFileInputRef.current.value = '';
      }
      return;
    }
    
    // Create preview URL and immediately set it
    const previewUrl = URL.createObjectURL(file);
    setMainImagePreview(previewUrl);
    setMainImageFile(file); // Store the actual File object
    
    // Don't set the formData.image to just the file name, as this isn't useful for the backend
    // The actual file will be sent in the FormData
    
    // Clear any existing error
    if (errors.image) {
      setErrors(prev => ({ ...prev, image: '' }));
    }
    
    // Reset the file input to allow selecting the same file again
    if (mainFileInputRef.current) {
      mainFileInputRef.current.value = '';
    }
  };
  
  // Handle additional images selection
  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Validate each file
    const newFiles = [];
    const newPreviews = [];
    let hasErrors = false;
    
    // Process all files, collecting valid ones while noting if any are invalid
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const error = validateImageFile(file);
      
      if (error) {
        // Set error but continue processing other files
        setErrors(prev => ({
          ...prev,
          additionalImages: error,
        }));
        hasErrors = true;
        // Don't use return here, continue to next file
        continue;
      }
      
      // Create preview URL for valid file
      const previewUrl = URL.createObjectURL(file);
      newPreviews.push(previewUrl);
      newFiles.push(file);
    }
    
    // Add valid files to state even if some files had errors
    if (newFiles.length > 0) {
      // Update state with new files
      setAdditionalImages(prev => [...prev, ...newFiles]);
      setAdditionalImagePreviews(prev => [...prev, ...newPreviews]);
      
      // Only clear error if all files were valid
      if (!hasErrors && errors.additionalImages) {
        setErrors(prev => ({ ...prev, additionalImages: '' }));
      }
    }
    
    // Reset the file input value so the same files can be selected again if needed
    if (additionalFileInputRef.current) {
      additionalFileInputRef.current.value = '';
    }
  };
  
  // Trigger main file input click
  const handleMainImageClick = (e) => {
    // Prevent any potential event bubbling
    if (e) e.preventDefault();
    
    if (mainFileInputRef.current) {
      mainFileInputRef.current.click();
    }
  };
  
  // Trigger additional file input click
  const handleAdditionalImagesClick = (e) => {
    // Prevent any potential event bubbling
    if (e) e.preventDefault();
    
    if (additionalFileInputRef.current) {
      additionalFileInputRef.current.click();
    }
  };
  
  // Remove main image
  const handleRemoveMainImage = () => {
    // Release any object URLs to prevent memory leaks
    if (mainImagePreview && mainImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(mainImagePreview);
    }
    
    setMainImagePreview('');
    setMainImageFile(null);
    setFormData(prev => ({ ...prev, image: '' }));
    
    // If we are editing a product and removing an existing image, add to removal list
    if (initialData.id && initialData.image) {
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
    
    // Release any object URLs to prevent memory leaks
    if (imageUrl && imageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imageUrl);
    }
    
    // If it's a new file (part of additionalImages), remove it
    if (index < additionalImages.length) {
      setAdditionalImages(prev => prev.filter((_, i) => i !== index));
    }
    
    // If it's an existing image (from initialData) and we're editing, add to removal list
    if (initialData.id && initialData.images && index < initialData.images.length) {
      setImagesToRemove(prev => [...prev, initialData.images[index]]);
    }
    
    // Update preview state
    setAdditionalImagePreviews(prev => prev.filter((_, i) => i !== index));
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
    
    // Add shop_id parameter to prevent 400 error "شناسه فروشگاه الزامی است" (Store ID is required)
    if (initialData && initialData.shop_id) {
      productData.append('shop_id', initialData.shop_id);
    } else {
      // If no shop_id in initialData, check if there's a default store ID in localStorage or context
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user && user.shop_id) {
        productData.append('shop_id', user.shop_id);
      } else if (localStorage.getItem('shop_id')) {
        productData.append('shop_id', localStorage.getItem('shop_id'));
      } else {
        // As a last resort, use a default store ID (adjust as needed for your application)
        productData.append('shop_id', '1'); // Default store ID
      }
    }
    
    // Append main image file if there's a new one
    if (mainImageFile && mainImageFile instanceof File) {
      productData.append('image', mainImageFile);
    } else {
      // If we have an existing image path, handle that
      if (mainImagePreview && typeof mainImagePreview === 'string' && mainImagePreview.trim() !== '') {
        productData.append('keepExistingImage', 'true');
        
        // Extract just the filename from the full URL
        let existingImagePath = mainImagePreview;
        
        // Handle full URL case
        if (mainImagePreview.includes('/uploads/products/')) {
          const match = mainImagePreview.match(/\/uploads\/products\/([^?#]+)/);
          existingImagePath = match ? match[1] : mainImagePreview;
        }
        
        if (existingImagePath && existingImagePath.trim() !== '') {
          productData.append('existingImagePath', existingImagePath);
        }
      }
    }
    
    // Append additional image files (only actual File objects)
    if (additionalImages && additionalImages.length > 0) {
      let validFilesAdded = false;
      additionalImages.forEach(file => {
        if (file instanceof File) {
          productData.append('additionalImages', file);
          validFilesAdded = true;
        }
      });
      
      // If no valid files were added, ensure we don't send an empty array
      if (!validFilesAdded) {
        productData.delete('additionalImages');
      }
    }
    
    // For existing additional images that should be kept
    if (initialData.images && Array.isArray(initialData.images)) {
      // Only include images that haven't been marked for removal
      const imagesToKeep = initialData.images.filter(img => !imagesToRemove.includes(img));
      
      if (imagesToKeep && imagesToKeep.length > 0) {
        productData.append('keepExistingAdditionalImages', JSON.stringify(imagesToKeep));
      }
    }
    
    // Append list of images to remove
    if (imagesToRemove && imagesToRemove.length > 0) {
      productData.append('removeImages', JSON.stringify(imagesToRemove));
    }
    
    // Call parent submission handler
    onSubmit(productData);
  };
  
  // For image previews, simply use the path directly - the backend provides full URLs now
  const getImageUrl = (path) => path;
  
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
                  src={mainImagePreview instanceof File ? URL.createObjectURL(mainImagePreview) : mainImagePreview}
                  alt={formData.name || t('products.productImage')} 
                  className="max-h-48 max-w-full rounded-md"
                  onError={(e) => {
                    e.target.onerror = null;
                    // Use data URI instead of external placeholder service to avoid network errors
                    e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AArial%2C%20Helvetica%2C%20sans-serif%3Bfont-size%3A20pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Crect%20width%3D%22400%22%20height%3D%22400%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20id%3D%22holder_text%22%20x%3D%22100%22%20y%3D%22220%22%3ENo Image%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fsvg%3E';
                  }}
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
                      name="image"
                      type="file"
                      className="sr-only"
                      accept="image/jpeg,image/png,image/gif,image/jpg"
                      ref={mainFileInputRef}
                      onChange={handleMainImageChange}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">{t('products.imageSizeLimit')}</p>
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
                    src={preview instanceof File ? URL.createObjectURL(preview) : preview}
                    alt={`${t('products.productImage')} ${index + 1}`}
                    className="h-32 w-full object-cover rounded-md border border-gray-200"
                    onError={(e) => {
                      e.target.onerror = null;
                      // Use data URI instead of external placeholder service to avoid network errors
                      e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AArial%2C%20Helvetica%2C%20sans-serif%3Bfont-size%3A14pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22%23eee%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2220%22%20y%3D%2256.5%22%3ENo Image%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fsvg%3E';
                    }}
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
          <label 
            htmlFor="additional-images-upload" 
            className="mt-2 flex justify-center items-center px-6 py-4 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-gray-50"
          >
            <div className="text-center">
              <FiPlus className="mx-auto h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-600 mt-2">{t('products.addMoreImages')}</p>
            </div>
          </label>
          <input
            id="additional-images-upload"
            type="file"
            className="sr-only"
            accept="image/jpeg,image/png,image/gif,image/jpg"
            multiple
            ref={additionalFileInputRef}
            onChange={handleAdditionalImagesChange}
          />
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