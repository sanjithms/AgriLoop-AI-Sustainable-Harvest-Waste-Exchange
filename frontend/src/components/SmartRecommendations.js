import React from 'react';
import '../styles/SmartRecommendations.css';

const SmartRecommendations = () => {
  return (
    <div className="smart-recommendations">
      <div className="recommendations-header">
        <i className="bi bi-robot"></i>
        <h3>AI-Powered Recommendations</h3>
      </div>
      
      <div className="recommendations-list">
        <div className="recommendation-card">
          <div className="recommendation-icon">
            <i className="bi bi-recycle"></i>
          </div>
          <div className="recommendation-content">
            <h4>Composting Techniques</h4>
            <p>Advanced methods for composting various types of agricultural waste.</p>
          </div>
        </div>
        
        <div className="recommendation-card">
          <div className="recommendation-icon">
            <i className="bi bi-lightning"></i>
          </div>
          <div className="recommendation-content">
            <h4>Biogas Production</h4>
            <p>How to convert animal waste and crop residues into biogas for energy.</p>
          </div>
        </div>
        
        <div className="recommendation-card">
          <div className="recommendation-icon">
            <i className="bi bi-flower1"></i>
          </div>
          <div className="recommendation-content">
            <h4>Organic Fertilizers</h4>
            <p>Creating organic fertilizers from agricultural waste materials.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartRecommendations;