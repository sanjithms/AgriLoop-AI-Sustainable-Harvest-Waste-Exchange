import React from 'react';

const Meta = ({ title, description, keywords }) => {
  // Update document title directly
  React.useEffect(() => {
    // Set document title
    document.title = title;

    // Set meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = description;

    // Set meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.content = keywords;

    // Cleanup function
    return () => {
      document.title = 'Smart Agri System';
    };
  }, [title, description, keywords]);

  return null; // This component doesn't render anything
};

Meta.defaultProps = {
  title: 'Smart Agri System | Agricultural Products & Waste Management',
  description: 'Buy and sell agricultural products, learn about waste management, and connect with farmers and recyclers.',
  keywords: 'agriculture, farming, waste management, organic products, fertilizers, seeds, equipment, recycling'
};

export default Meta;