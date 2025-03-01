import { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiMaximize2, FiX } from 'react-icons/fi';

/**
 * Component for displaying an image gallery with navigation
 * 
 * @param {Array} images - Array of image URLs
 * @param {string} mainImage - Main image URL
 * @param {string} altText - Alt text for images
 */
const ImageGallery = ({ images = [], mainImage = '', altText = 'Product Image' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreenMode, setFullscreenMode] = useState(false);
  
  // Combine main image and additional images into a single array
  const allImages = [mainImage, ...images].filter(Boolean);
  
  // Handle image errors
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found';
  };
  
  // Navigate to the next image
  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % allImages.length);
  };
  
  // Navigate to the previous image
  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? allImages.length - 1 : prevIndex - 1));
  };
  
  // Set a specific image as current
  const setImage = (index) => {
    setCurrentIndex(index);
  };
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setFullscreenMode(!fullscreenMode);
  };
  
  // If there are no images, show a placeholder
  if (allImages.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }
  
  return (
    <>
      {/* Main image display */}
      <div className="relative w-full bg-white">
        <div className="relative aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg">
          <img
            src={allImages[currentIndex]}
            alt={`${altText} ${currentIndex + 1}`}
            className="h-full w-full object-contain object-center"
            onError={handleImageError}
          />
          
          {/* Navigation buttons for larger screens */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-75 rounded-full p-2 shadow-md hover:bg-opacity-100 focus:outline-none"
                aria-label="Previous image"
              >
                <FiChevronLeft size={24} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-75 rounded-full p-2 shadow-md hover:bg-opacity-100 focus:outline-none"
                aria-label="Next image"
              >
                <FiChevronRight size={24} />
              </button>
            </>
          )}
          
          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className="absolute top-2 right-2 bg-white bg-opacity-75 rounded-full p-2 shadow-md hover:bg-opacity-100 focus:outline-none"
            aria-label="Toggle fullscreen"
          >
            <FiMaximize2 size={18} />
          </button>
        </div>
      </div>
      
      {/* Thumbnail navigation */}
      {allImages.length > 1 && (
        <div className="mt-4 grid grid-cols-5 gap-2">
          {allImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setImage(index)}
              className={`relative rounded-md overflow-hidden h-16 focus:outline-none ${
                index === currentIndex ? 'ring-2 ring-indigo-500' : 'ring-1 ring-gray-200'
              }`}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
                onError={handleImageError}
              />
            </button>
          ))}
        </div>
      )}
      
      {/* Fullscreen modal */}
      {fullscreenMode && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 text-white p-2 hover:bg-gray-800 rounded-full focus:outline-none"
            aria-label="Close fullscreen"
          >
            <FiX size={24} />
          </button>
          
          <div className="relative w-full max-w-4xl">
            <img
              src={allImages[currentIndex]}
              alt={`${altText} ${currentIndex + 1} (fullscreen)`}
              className="max-h-screen max-w-full"
              onError={handleImageError}
            />
            
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-3 hover:bg-opacity-75 focus:outline-none"
                  aria-label="Previous image"
                >
                  <FiChevronLeft size={32} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-3 hover:bg-opacity-75 focus:outline-none"
                  aria-label="Next image"
                >
                  <FiChevronRight size={32} />
                </button>
              </>
            )}
          </div>
          
          {/* Thumbnail navigation in fullscreen mode */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 overflow-x-auto py-2 px-4 bg-black bg-opacity-50 rounded-lg">
              {allImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setImage(index)}
                  className={`relative rounded-md overflow-hidden h-12 w-12 focus:outline-none ${
                    index === currentIndex ? 'ring-2 ring-white' : 'ring-1 ring-gray-600 opacity-60'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="h-full w-full object-cover"
                    onError={handleImageError}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ImageGallery; 