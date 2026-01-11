import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const CropDiseaseAnalyzer = () => {
  const [formData, setFormData] = useState({
    symptoms: '',
    cropType: ''
  });
  const [analysis, setAnalysis] = useState(null);
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
    setAnalysis(null);
    
    try {
      const response = await axios.post(`${API_URL}/ai/analyze-disease`, formData);
      setAnalysis(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to analyze disease');
      console.error('Error analyzing crop disease:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="card mb-4">
      <div className="card-header">
        <h5 className="mb-0">AI Crop Disease Analyzer</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="symptoms" className="form-label">Describe Symptoms</label>
            <textarea
              className="form-control"
              id="symptoms"
              name="symptoms"
              rows="3"
              value={formData.symptoms}
              onChange={handleChange}
              placeholder="e.g., yellow leaves with black spots, wilting plants"
              required
            ></textarea>
          </div>
          
          <div className="mb-3">
            <label htmlFor="cropType" className="form-label">Crop Type</label>
            <input
              type="text"
              className="form-control"
              id="cropType"
              name="cropType"
              value={formData.cropType}
              onChange={handleChange}
              placeholder="e.g., Tomato, Rice, Wheat"
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
            Analyze Disease
          </button>
        </form>
        
        {error && (
          <div className="alert alert-danger mt-3" role="alert">
            {error}
          </div>
        )}
        
        {analysis && (
          <div className="mt-4">
            <div className="alert alert-info">
              <h6 className="alert-heading">Diagnosis:</h6>
              <p className="mb-1">
                <strong>{analysis.disease}</strong> 
                <span className="ms-2 badge bg-primary">
                  {(analysis.confidence * 100).toFixed(2)}% confidence
                </span>
              </p>
              
              <hr />
              
              <h6>Other Possible Diseases:</h6>
              <ul className="mb-3">
                {analysis.allPossibleDiseases.slice(1, 4).map((item, index) => (
                  <li key={index}>
                    {item.disease} ({(item.probability * 100).toFixed(2)}%)
                  </li>
                ))}
              </ul>
              
              <h6>Recommended Treatment:</h6>
              <div className="p-2 bg-white rounded">
                {analysis.treatment.split('\n').map((line, index) => (
                  <p key={index} className="mb-1">{line}</p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CropDiseaseAnalyzer;