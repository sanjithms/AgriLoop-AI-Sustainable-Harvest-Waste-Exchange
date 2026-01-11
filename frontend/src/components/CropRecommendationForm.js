import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const CropRecommendationForm = () => {
  const [formData, setFormData] = useState({
    soilType: '',
    climate: '',
    region: '',
    previousCrops: ''
  });
  const [recommendations, setRecommendations] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_URL}/ai/crop-recommendations`, formData);
      setRecommendations(response.data.recommendations);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to get recommendations');
      console.error('Error getting crop recommendations:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="card mb-4">
      <div className="card-header">
        <h5 className="mb-0">AI Crop Recommendations</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="soilType" className="form-label">Soil Type</label>
            <select
              className="form-select"
              id="soilType"
              name="soilType"
              value={formData.soilType}
              onChange={handleChange}
              required
            >
              <option value="">Select Soil Type</option>
              <option value="Clay">Clay</option>
              <option value="Sandy">Sandy</option>
              <option value="Loamy">Loamy</option>
              <option value="Silt">Silt</option>
              <option value="Peaty">Peaty</option>
              <option value="Chalky">Chalky</option>
            </select>
          </div>
          
          <div className="mb-3">
            <label htmlFor="climate" className="form-label">Climate</label>
            <select
              className="form-select"
              id="climate"
              name="climate"
              value={formData.climate}
              onChange={handleChange}
              required
            >
              <option value="">Select Climate</option>
              <option value="Tropical">Tropical</option>
              <option value="Dry">Dry</option>
              <option value="Temperate">Temperate</option>
              <option value="Continental">Continental</option>
              <option value="Polar">Polar</option>
            </select>
          </div>
          
          <div className="mb-3">
            <label htmlFor="region" className="form-label">Region</label>
            <input
              type="text"
              className="form-control"
              id="region"
              name="region"
              value={formData.region}
              onChange={handleChange}
              placeholder="e.g., North India, California"
              required
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="previousCrops" className="form-label">Previous Crops</label>
            <input
              type="text"
              className="form-control"
              id="previousCrops"
              name="previousCrops"
              value={formData.previousCrops}
              onChange={handleChange}
              placeholder="e.g., Wheat, Rice"
            />
          </div>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            ) : null}
            Get Recommendations
          </button>
        </form>
        
        {error && (
          <div className="alert alert-danger mt-3" role="alert">
            {error}
          </div>
        )}
        
        {recommendations && (
          <div className="mt-4">
            <h6>Recommended Crops:</h6>
            <div className="p-3 bg-light rounded">
              {recommendations.split('\n').map((line, index) => (
                <p key={index} className="mb-1">{line}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CropRecommendationForm;