import React, { useState } from 'react';

/**
 * OptimizedImage component with error handling and lazy loading
 * 
 * @param {string} src - The image source URL
 * @param {string} alt - Alt text for the image
 * @param {string} className - CSS classes to apply to the image
 * @param {object} style - Inline styles to apply to the image
 * @param {string} fallbackSrc - Fallback image to display if the main image fails to load
 * @param {object} props - Any additional props to pass to the img element
 */
const OptimizedImage = ({ 
  src, 
  alt = "Image", 
  className = "", 
  style = {}, 
  fallbackSrc = "https://via.placeholder.com/400x300?text=No+Image",
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      console.log(`Image failed to load: ${src}`);
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
      onError={handleError}
      {...props}
    />
  );
};

export default OptimizedImage;