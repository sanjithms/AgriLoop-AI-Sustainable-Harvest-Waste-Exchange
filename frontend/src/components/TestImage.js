import React, { useState } from 'react';
import { getImageUrl } from '../utils/imageUtils';

const TestImage = ({ src, alt, width = '100%', height = 'auto' }) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentUrl, setCurrentUrl] = useState('');
  const MAX_RETRIES = 2;

  // Get the API base URL from environment or use default
  const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';
  // Extract the server base URL (remove '/api' if present)
  const serverBaseUrl = apiBaseUrl.endsWith('/api')
    ? apiBaseUrl.substring(0, apiBaseUrl.length - 4)
    : apiBaseUrl;

  // Try different URL formats for the image
  const tryDifferentUrl = () => {
    if (retryCount >= MAX_RETRIES) {
      setError(true);
      setLoaded(true);
      return null;
    }

    setRetryCount(prev => prev + 1);

    // Try different URL formats based on retry count
    if (retryCount === 0) {
      // First retry: Try direct URL with just the filename
      const filename = src.split(/[/\\]/).pop();
      const directUrl = `${serverBaseUrl}/uploads/${filename}`;
      console.log(`First retry URL (${alt || 'unnamed'}):`, directUrl);
      setCurrentUrl(directUrl);
      return directUrl;
    } else {
      // Second retry: Try localhost direct URL
      const filename = src.split(/[/\\]/).pop();
      const localhostUrl = `http://localhost:5002/uploads/${filename}`;
      console.log(`Second retry URL (${alt || 'unnamed'}):`, localhostUrl);
      setCurrentUrl(localhostUrl);
      return localhostUrl;
    }
  };

  // Initial URL from the utility function
  const initialImageUrl = getImageUrl(src);
  const fallbackUrl = 'https://via.placeholder.com/400x400?text=No+Image';

  // Set the initial URL if currentUrl is empty
  if (!currentUrl && initialImageUrl) {
    setCurrentUrl(initialImageUrl);
  }

  return (
    <div className="test-image-container">
      <img
        src={error ? fallbackUrl : currentUrl || initialImageUrl}
        alt={alt || 'Image'}
        style={{
          width,
          height,
          display: loaded || error ? 'block' : 'none',
          border: error ? '1px solid red' : loaded ? '1px solid green' : 'none'
        }}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          console.error('Image failed to load:', currentUrl || initialImageUrl);

          // Try a different URL format
          const newUrl = tryDifferentUrl();
          if (newUrl) {
            e.target.src = newUrl;
          } else {
            setError(true);
            setLoaded(true);
          }
        }}
      />

      {!loaded && !error && (
        <div style={{
          width,
          height: typeof height === 'string' ? height : `${height}px`,
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          Loading...
        </div>
      )}

      <div className="image-debug-info" style={{ fontSize: '12px', marginTop: '4px' }}>
        <div><strong>Original:</strong> {src}</div>
        <div><strong>URL:</strong> {currentUrl || initialImageUrl}</div>
        <div><strong>Status:</strong> {error ? 'Error' : loaded ? 'Loaded' : 'Loading'}</div>
        <div><strong>Retries:</strong> {retryCount}/{MAX_RETRIES}</div>
      </div>
    </div>
  );
};

export default TestImage;