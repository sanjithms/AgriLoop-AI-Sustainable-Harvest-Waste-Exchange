import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Meta from '../components/Meta';

const ApiDebugPage = () => {
  const [apiStatus, setApiStatus] = useState('Checking...');
  const [apiUrl, setApiUrl] = useState('');
  const [testResponse, setTestResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState({
    token: null,
    sessionToken: null,
    userId: null,
    role: null
  });

  useEffect(() => {
    // Get the API URL from environment
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';
    setApiUrl(apiUrl);

    // Check authentication status
    setAuthStatus({
      token: localStorage.getItem('token'),
      sessionToken: localStorage.getItem('sessionToken'),
      userId: localStorage.getItem('userId'),
      role: localStorage.getItem('role')
    });

    // Test API connection
    testApiConnection();
  }, []);

  const testApiConnection = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to connect to the API
      const response = await api.get('/health-check');
      setTestResponse(response.data);
      setApiStatus('Connected');
    } catch (err) {
      console.error('API connection error:', err);
      setError(err.message || 'Failed to connect to API');
      setApiStatus('Error');
    } finally {
      setLoading(false);
    }
  };

  const testProductsApi = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch products
      const response = await api.get('/products');
      setTestResponse(response.data);
      setApiStatus('Products API working');
    } catch (err) {
      console.error('Products API error:', err);
      setError(err.message || 'Failed to fetch products');
      setApiStatus('Error');
    } finally {
      setLoading(false);
    }
  };

  const testWasteProductsApi = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch waste products
      const response = await api.get('/waste-products');
      setTestResponse(response.data);
      setApiStatus('Waste Products API working');
    } catch (err) {
      console.error('Waste Products API error:', err);
      setError(err.message || 'Failed to fetch waste products');
      setApiStatus('Error');
    } finally {
      setLoading(false);
    }
  };

  const clearLocalStorage = () => {
    if (window.confirm('Are you sure you want to clear all local storage data? This will log you out.')) {
      localStorage.clear();
      setAuthStatus({
        token: null,
        sessionToken: null,
        userId: null,
        role: null
      });
      alert('Local storage cleared. Please refresh the page.');
    }
  };

  return (
    <div className="container mt-5">
      <Meta title="API Debug | Smart Agri System" />
      
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-primary text-white">
          <h2 className="mb-0">API Debug Tool</h2>
        </div>
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-header">API Configuration</div>
                <div className="card-body">
                  <p><strong>API URL:</strong> {apiUrl}</p>
                  <p><strong>Status:</strong> 
                    <span className={`badge ms-2 ${
                      apiStatus === 'Connected' || apiStatus === 'Products API working' || apiStatus === 'Waste Products API working' 
                        ? 'bg-success' 
                        : apiStatus === 'Checking...' 
                          ? 'bg-warning' 
                          : 'bg-danger'
                    }`}>
                      {apiStatus}
                    </span>
                  </p>
                  {error && (
                    <div className="alert alert-danger mt-3">
                      <strong>Error:</strong> {error}
                    </div>
                  )}
                </div>
                <div className="card-footer">
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-primary" 
                      onClick={testApiConnection}
                      disabled={loading}
                    >
                      Test Connection
                    </button>
                    <button 
                      className="btn btn-success" 
                      onClick={testProductsApi}
                      disabled={loading}
                    >
                      Test Products API
                    </button>
                    <button 
                      className="btn btn-info" 
                      onClick={testWasteProductsApi}
                      disabled={loading}
                    >
                      Test Waste API
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-header">Authentication Status</div>
                <div className="card-body">
                  <p><strong>Token:</strong> {authStatus.token ? '✅ Present' : '❌ Not found'}</p>
                  <p><strong>Session Token:</strong> {authStatus.sessionToken ? '✅ Present' : '❌ Not found'}</p>
                  <p><strong>User ID:</strong> {authStatus.userId || 'Not found'}</p>
                  <p><strong>Role:</strong> {authStatus.role || 'Not found'}</p>
                </div>
                <div className="card-footer">
                  <button 
                    className="btn btn-danger" 
                    onClick={clearLocalStorage}
                  >
                    Clear Local Storage
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {testResponse && (
            <div className="card mt-4">
              <div className="card-header">API Response</div>
              <div className="card-body">
                <pre className="bg-light p-3 rounded" style={{ maxHeight: '300px', overflow: 'auto' }}>
                  {JSON.stringify(testResponse, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiDebugPage;