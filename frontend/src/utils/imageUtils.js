/**
 * Utility functions for handling images
 */

/**
 * Formats an image URL correctly based on whether it's a full URL or a relative path
 * @param {string} imagePath - The image path from the server
 * @param {string} fallbackUrl - The fallback URL to use if the image path is invalid
 * @returns {string} - The properly formatted image URL
 */
export const getImageUrl = (imagePath, fallbackUrl = 'https://via.placeholder.com/400x400?text=No+Image') => {
  if (!imagePath) {
    return fallbackUrl;
  }

  try {
    // If it's already a full URL, return it as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    // Get the API base URL from environment or use default
    const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';
    // Extract the server base URL (remove '/api' if present)
    const serverBaseUrl = apiBaseUrl.endsWith('/api')
      ? apiBaseUrl.substring(0, apiBaseUrl.length - 4)
      : apiBaseUrl;

    // Extract just the filename in most cases
    const filename = imagePath.split(/[/\\]/).pop();
    
    // Log the image path for debugging
    console.log('Image path:', imagePath, 'Filename:', filename);
    
    // Return the full URL to the image on the server
    return `${serverBaseUrl}/uploads/${filename}`;
  } catch (error) {
    console.error('Error formatting image URL:', error, imagePath);
    return fallbackUrl;
  }
};