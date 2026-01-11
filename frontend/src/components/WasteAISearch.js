import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import '../styles/WasteAISearch.css';

const WasteAISearch = () => {
  const [term, setTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('recentWasteSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const saveSearch = (searchTerm, result) => {
    const updatedSearches = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentWasteSearches', JSON.stringify(updatedSearches));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!term.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/waste-info/${encodeURIComponent(term.trim())}`);
      
      if (response.data.success) {
        setSearchResults(response.data);
        saveSearch(term, response.data);
      } else {
        setError('No information found for this waste product.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.response?.data?.message || 'Failed to search for waste information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="waste-ai-search">
      <div className="card shadow-sm border-0">
        <div className="card-header bg-success text-white">
          <h5 className="mb-0">
            <i className="bi bi-search me-2"></i>
            AI Waste Value Analyzer
          </h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Enter waste type (e.g., rice straw, sugarcane bagasse)"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                disabled={loading}
              />
              <button className="btn btn-success" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <i className="bi bi-search me-2"></i>
                    Analyze
                  </>
                )}
              </button>
            </div>
          </form>

          {error && <div className="alert alert-danger">{error}</div>}

          {searchResults && (
            <div className="search-results">
              <div className="result-header">
                <h4>{searchResults.data.waste_name}</h4>
                <span className="badge bg-success">{searchResults.data.category}</span>
              </div>

              <div className="result-section mb-4">
                <h5><i className="bi bi-clipboard-data me-2"></i>Composition</h5>
                <div className="composition-grid">
                  {Object.entries(searchResults.data.composition).map(([key, value]) => (
                    <div key={key} className="composition-item">
                      <div className="progress">
                        <div 
                          className="progress-bar bg-success" 
                          style={{width: `${value}%`}}
                          role="progressbar"
                          aria-valuenow={value}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>
                      <div className="composition-label">
                        <span>{key.replace('_', ' ')}</span>
                        <span>{value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="result-section mb-4">
                <h5><i className="bi bi-gear me-2"></i>Processing Methods</h5>
                <div className="methods-grid">
                  {searchResults.data.processing_methods.map((method, index) => (
                    <div key={index} className="method-card">
                      <h6>{method.method}</h6>
                      <p>{method.description}</p>
                      <div className="method-details">
                        <div className="complexity">
                          <span>Complexity:</span>
                          <span className={`badge bg-${method.complexity === 'Low' ? 'success' : method.complexity === 'Medium' ? 'warning' : 'danger'}`}>
                            {method.complexity}
                          </span>
                        </div>
                        <div className="cost">
                          <span>Est. Cost:</span>
                          <span>₹{method.estimated_cost.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="equipment">
                        <h6>Required Equipment:</h6>
                        <ul className="list-unstyled">
                          {method.equipment_needed.map((equipment, i) => (
                            <li key={i}><i className="bi bi-tools me-2"></i>{equipment}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="result-section mb-4">
                <h5><i className="bi bi-currency-rupee me-2"></i>Market Value & Uses</h5>
                <p className="market-value">{searchResults.data.market_value}</p>
                <div className="uses-grid">
                  {searchResults.data.uses.map((use, index) => (
                    <div key={index} className="use-card">
                      <h6>{use.application}</h6>
                      <p>{use.description}</p>
                      <div className="use-details">
                        <div className="technology">
                          <span>Technology:</span>
                          <span>{use.technology_required}</span>
                        </div>
                        <div className="roi">
                          <span>Est. ROI:</span>
                          <span>{use.estimated_roi}</span>
                        </div>
                        <div className="market-value">
                          <span>Market Value:</span>
                          <span className={`badge bg-${use.market_value === 'Low' ? 'secondary' : use.market_value === 'Medium' ? 'info' : use.market_value === 'High' ? 'success' : 'primary'}`}>
                            {use.market_value}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="result-section mb-4">
                <h5><i className="bi bi-globe me-2"></i>Environmental Benefits</h5>
                <div className="benefits-grid">
                  {searchResults.data.environmental_benefits.map((benefit, index) => (
                    <div key={index} className="benefit-card">
                      <h6>{benefit.benefit}</h6>
                      <p>{benefit.impact}</p>
                      <div className="metrics">
                        <i className="bi bi-graph-up text-success me-2"></i>
                        {benefit.metrics}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="result-section mb-4">
                <h5><i className="bi bi-book me-2"></i>Case Studies & Resources</h5>
                {searchResults.data.case_studies.map((study, index) => (
                  <div key={index} className="case-study-card mb-3">
                    <h6>{study.title}</h6>
                    <div className="case-study-details">
                      <span><i className="bi bi-geo-alt me-1"></i>{study.location}</span>
                      <span><i className="bi bi-calendar me-1"></i>{study.implementation_year}</span>
                    </div>
                    <p><strong>Success Metrics:</strong> {study.success_metrics}</p>
                    <div className="challenges">
                      <p><strong>Challenges:</strong> {study.challenges_faced}</p>
                      <p><strong>Solutions:</strong> {study.solutions_applied}</p>
                    </div>
                  </div>
                ))}
                <div className="resources-grid mt-3">
                  {searchResults.data.resources.map((resource, index) => (
                    <a 
                      key={index} 
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="resource-link"
                    >
                      <i className={`bi bi-${
                        resource.type === 'Guide' ? 'book' :
                        resource.type === 'Video' ? 'play-circle' :
                        resource.type === 'Research Paper' ? 'file-text' :
                        resource.type === 'Tool' ? 'tools' :
                        'link'
                      } me-2`}></i>
                      {resource.title}
                      <span className="resource-type">{resource.type}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!searchResults && !error && !loading && (
            <div className="suggestions">
              <h6>Recent Searches:</h6>
              <div className="recent-searches">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    className="btn btn-outline-secondary btn-sm me-2 mb-2"
                    onClick={() => {
                      setTerm(search);
                      handleSearch({ preventDefault: () => {} });
                    }}
                  >
                    <i className="bi bi-clock-history me-1"></i>
                    {search}
                  </button>
                ))}
              </div>
              <h6 className="mt-3">Try searching for:</h6>
              <div className="search-examples">
                <button
                  className="btn btn-outline-success btn-sm me-2 mb-2"
                  onClick={() => {
                    setTerm('Rice Straw');
                    handleSearch({ preventDefault: () => {} });
                  }}
                >
                  Rice Straw
                </button>
                <button
                  className="btn btn-outline-success btn-sm me-2 mb-2"
                  onClick={() => {
                    setTerm('Sugarcane Bagasse');
                    handleSearch({ preventDefault: () => {} });
                  }}
                >
                  Sugarcane Bagasse
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WasteAISearch;