import { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiMaximize2, FiX } from 'react-icons/fi';
import { getFullImageUrl } from '../config';

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
  const allImages = [mainImage, ...images]
    .filter(img => img && img !== 'null' && img !== 'undefined' && img.trim && img.trim() !== '');
  
  console.log('ImageGallery - processed images:', { mainImage, additionalImages: images, processedImages: allImages });
  
  // Handle image errors
  const handleImageError = (e) => {
    e.target.onerror = null;
    // Use data URI instead of external placeholder service to avoid network errors
    e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AArial%2C%20Helvetica%2C%20sans-serif%3Bfont-size%3A20pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Crect%20width%3D%22400%22%20height%3D%22400%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20id%3D%22holder_text%22%20x%3D%22100%22%20y%3D%22220%22%3EImage%20Not%20Found%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fsvg%3E';
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