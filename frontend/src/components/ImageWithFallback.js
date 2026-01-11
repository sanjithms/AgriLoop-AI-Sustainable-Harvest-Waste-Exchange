import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../utils/imageUtils';

/**
 * A component that displays an image with fallback handling
 * Improved to better handle image loading errors
 */
const ImageWithFallback = ({
  src,
  alt,
  className,
  style,
  fallbackSrc = 'https://via.placeholder.com/400x400?text=No+Image',
  ...props
}) => {
  const [error, setError] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;

  useEffect(() => {
    // Reset error state when src changes
    setError(false);
    setRetryCount(0);

    // Process the source URL
    if (!src) {
      setImageUrl(fallbackSrc);
      return;
    }

    try {
      // First attempt - use the getImageUrl utility
      const url = getImageUrl(src);
      console.log(`Image URL (${alt || 'unnamed'})`, url);
      setImageUrl(url);

      // Preload the image to check if it exists
      const img = new Image();
      img.onload = () => {
        console.log(`Image loaded successfully (${alt || 'unnamed'}):`, url);
      };
      img.onerror = () => {
        console.warn(`Image preload failed (${alt || 'unnamed'}):`, url);

        // Try direct URL as fallback if it contains 'uploads' or has a C: drive path
        if ((src.includes('uploads') || src.includes('C:')) && retryCount < MAX_RETRIES) {
          console.log(`Retrying with direct URL (${alt || 'unnamed'})...`);
          setRetryCount(prev => prev + 1);

          // Extract just the filename from the path
          const filename = src.split(/[/\\]/).pop();

          // Try a different URL format - direct to localhost
          const directUrl = `http://localhost:5002/uploads/${filename}`;
          console.log(`Retry URL (${alt || 'unnamed'}):`, directUrl);
          setImageUrl(directUrl);
        } else {
          setError(true);
        }
      };
      img.src = url;
    } catch (err) {
      console.error(`Error processing image URL (${alt || 'unnamed'}):`, err);

      // Try a direct URL as a last resort
      try {
        // If src contains 'uploads/', try to use it directly with the server base URL
        if (src.includes('uploads/')) {
          const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';
          const serverBaseUrl = apiBaseUrl.endsWith('/api')
            ? apiBaseUrl.substring(0, apiBaseUrl.length - 4)
            : apiBaseUrl;

          // Extract the uploads part
          const uploadsIndex = src.indexOf('uploads/');
          const relevantPath = src.substring(uploadsIndex);
          const directUrl = `${serverBaseUrl}/${relevantPath}`;

          console.log(`Fallback URL after error (${alt || 'unnamed'}):`, directUrl);
          setImageUrl(directUrl);
        } else {
          setError(true);
        }
      } catch (fallbackErr) {
        console.error(`Fallback URL also failed (${alt || 'unnamed'}):`, fallbackErr);
        setError(true);
      }
    }
  }, [src, fallbackSrc, retryCount, alt]);

  return (
    <div className="image-with-fallback-container">
      <img
        src={error ? fallbackSrc : imageUrl}
        alt={alt || 'Image'}
        className={className || ''}
        style={style || {}}
        onError={(e) => {
          console.warn(`Image failed to load in render (${alt || 'unnamed'}):`, imageUrl);
          e.target.onerror = null; // Prevent infinite loop

          if (retryCount < MAX_RETRIES) {
            // Try one more time with a direct URL approach
            setRetryCount(prev => prev + 1);

            // Extract just the filename from the path
            const filename = src.split(/[/\\]/).pop();

            // Try with a direct localhost URL as a last resort
            const directUrl = `http://localhost:5002/uploads/${filename}`;
            console.log(`Last resort URL (${alt || 'unnamed'}):`, directUrl);
            e.target.src = directUrl;
          } else {
            setError(true);
          }
        }}
        {...props}
      />
      {process.env.NODE_ENV === 'development' && (
        <div style={{ display: 'none' }}>
          <div>Original: {src}</div>
          <div>URL: {imageUrl}</div>
          <div>Status: {error ? 'Error' : 'Loading/Loaded'}</div>
        </div>
      )}
    </div>
  );
};

export default ImageWithFallback;