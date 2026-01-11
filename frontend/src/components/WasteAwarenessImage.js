import React, { useState } from 'react';

/**
 * A specialized image component for the Waste Awareness page
 * with reliable fallbacks and error handling
 */
const WasteAwarenessImage = ({
  src,
  alt,
  className,
  style,
  fallbackCategory = 'waste',
  ...props
}) => {
  const [error, setError] = useState(false);
  
  // Map of reliable fallback images for different categories - directly related to waste management
  const fallbackImages = {
    // Agricultural waste images
    waste: 'https://images.pexels.com/photos/2537122/pexels-photo-2537122.jpeg', // Farm waste

    // Composting related
    compost: 'https://images.pexels.com/photos/1301856/pexels-photo-1301856.jpeg', // Actual compost pile

    // Biogas and energy production
    biogas: 'https://images.pexels.com/photos/2581704/pexels-photo-2581704.jpeg', // Biogas facility

    // Mulching and ground cover
    mulch: 'https://images.pexels.com/photos/6231870/pexels-photo-6231870.jpeg', // Actual mulch

    // Fertilizer and soil amendments
    fertilizer: 'https://images.pexels.com/photos/4505171/pexels-photo-4505171.jpeg', // Organic fertilizer

    // Environmental issues
    pollution: 'https://images.pexels.com/photos/4167544/pexels-photo-4167544.jpeg', // Agricultural pollution
    water: 'https://images.pexels.com/photos/1308084/pexels-photo-1308084.jpeg', // Water resources
    air: 'https://images.pexels.com/photos/4167579/pexels-photo-4167579.jpeg', // Air quality
    soil: 'https://images.pexels.com/photos/5560867/pexels-photo-5560867.jpeg', // Soil health

    // Sustainable practices
    greenhouse: 'https://images.pexels.com/photos/2286895/pexels-photo-2286895.jpeg', // Greenhouse farming
    sustainable: 'https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg', // Sustainable farming
    agriculture: 'https://images.pexels.com/photos/2165688/pexels-photo-2165688.jpeg', // Agriculture

    // Crop waste specific
    cropWaste: 'https://images.pexels.com/photos/5503252/pexels-photo-5503252.jpeg', // Crop residue

    // Horticultural waste
    horticulture: 'https://images.pexels.com/photos/5503250/pexels-photo-5503250.jpeg', // Plant waste

    // Animal waste
    animalWaste: 'https://images.pexels.com/photos/235725/pexels-photo-235725.jpeg', // Farm animals

    // Recycling and processing
    recycling: 'https://images.pexels.com/photos/802221/pexels-photo-802221.jpeg', // Recycling

    // Default fallback
    default: 'https://images.pexels.com/photos/2537122/pexels-photo-2537122.jpeg' // Agricultural waste
  };

  // Get the appropriate fallback image
  const getFallbackImage = () => {
    return fallbackImages[fallbackCategory] || fallbackImages.default;
  };

  return (
    <img
      src={error ? getFallbackImage() : src}
      alt={alt || 'Agricultural waste management image'}
      className={className || ''}
      style={style || {}}
      onError={(e) => {
        console.warn(`Image failed to load: ${src}`);
        e.target.onerror = null; // Prevent infinite loop
        setError(true);
      }}
      {...props}
    />
  );
};

export default WasteAwarenessImage;