import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import ImageWithFallback from '../components/ImageWithFallback';
import TestImage from '../components/TestImage';
import { getImageUrl } from '../utils/imageUtils';

const ImageDebug = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [testImages, setTestImages] = useState([]);
  const [imagePath, setImagePath] = useState('');
  const [processedUrl, setProcessedUrl] = useState('');
  const [showImage, setShowImage] = useState(false);

  // Fetch files from the server
  const fetchFiles = async () => {
    try {
      setLoading(true);
      console.log('Fetching files from server...');

      // Use the correct API endpoint
      const response = await api.get('/debug/files');
      console.log('Server response:', response.data);

      if (response.data && response.data.files) {
        setFiles(response.data.files);
        setError(null);

        if (response.data.message) {
          console.log('Server message:', response.data.message);
        }
      } else {
        console.error('Invalid response format:', response.data);
        setError('Invalid response format from server');
      }
    } catch (err) {
      console.error('Error fetching files:', err);

      let errorMessage = 'Failed to fetch files: ' + (err.message || 'Unknown error');

      // Add more details if available
      if (err.response) {
        errorMessage += ` (Status: ${err.response.status})`;
        console.error('Error response:', err.response.data);
      }

      setError(errorMessage);

      // Set empty files array to prevent undefined errors
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Handle file selection
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      setUploadStatus('Uploading...');
      const response = await api.post('/debug/upload-test', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setUploadStatus(`Upload successful: ${response.data.file}`);
      fetchFiles(); // Refresh the file list
    } catch (err) {
      console.error('Error uploading file:', err);
      setUploadStatus(`Upload failed: ${err.message || 'Unknown error'}`);

      // Show more detailed error information
      if (err.response) {
        console.error('Error response:', err.response.data);
        setUploadStatus(`Upload failed: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
      }
    }
  };

  // Add a test image to the list
  const addTestImage = () => {
    const imageUrl = prompt('Enter image URL or path:');
    if (imageUrl) {
      setTestImages([...testImages, imageUrl]);
    }
  };

  // Process image path
  const handleProcess = () => {
    if (!imagePath) return;

    try {
      const url = getImageUrl(imagePath);
      setProcessedUrl(url);
      setShowImage(true);
    } catch (error) {
      console.error('Error processing image path:', error);
      alert('Error processing image path: ' + error.message);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Image Debug Tool</h2>
      <p className="text-muted">Use this tool to diagnose image loading issues</p>

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Upload Test</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="fileInput" className="form-label">Select Image</label>
                <input
                  type="file"
                  className="form-control"
                  id="fileInput"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              <button
                className="btn btn-primary"
                onClick={handleUpload}
                disabled={!selectedFile}
              >
                Upload Test Image
              </button>
              {uploadStatus && (
                <div className="mt-2">
                  <small className={uploadStatus.includes('failed') ? 'text-danger' : 'text-success'}>
                    {uploadStatus}
                  </small>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Files in Uploads Directory</h5>
              <button className="btn btn-sm btn-outline-primary" onClick={fetchFiles}>Refresh</button>
            </div>
            <div className="card-body">
              {loading ? (
                <p>Loading files...</p>
              ) : error ? (
                <div className="alert alert-danger">{error}</div>
              ) : files.length === 0 ? (
                <p>No files found in uploads directory</p>
              ) : (
                <div>
                  <p className="mb-2">Found {files.length} files in uploads directory</p>
                  <ul className="list-group">
                    {files.map((file, index) => (
                      <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                        <span>{file}</span>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => setTestImages([...testImages, `uploads/${file}`])}
                        >
                          Test
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Test Image Path Processing</h5>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label htmlFor="imagePath" className="form-label">Enter Image Path:</label>
            <input
              type="text"
              className="form-control"
              id="imagePath"
              value={imagePath}
              onChange={(e) => setImagePath(e.target.value)}
              placeholder="e.g., uploads/image-123.jpg or backend/uploads/image-123.jpg"
            />
            <div className="form-text">
              Enter the image path as returned from the server API
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleProcess}
            disabled={!imagePath}
          >
            Process Path
          </button>

          {processedUrl && (
            <div className="mt-3">
              <h6>Processed URL:</h6>
              <code className="d-block p-2 bg-light">{processedUrl}</code>
            </div>
          )}
        </div>
      </div>

      {showImage && (
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">Image Preview</h5>
          </div>
          <div className="card-body text-center">
            <div className="mb-3">
              <h6>Using Direct URL:</h6>
              <img
                src={processedUrl}
                alt="Direct URL Test"
                className="img-fluid border rounded mb-2"
                style={{ maxHeight: '200px' }}
                onError={(e) => {
                  console.error('Direct image failed to load');
                  e.target.src = 'https://via.placeholder.com/400x300?text=Load+Failed';
                }}
              />
            </div>

            <div className="mb-3">
              <h6>Using ImageWithFallback Component:</h6>
              <ImageWithFallback
                src={imagePath}
                alt="Component Test"
                className="img-fluid border rounded"
                style={{ maxHeight: '200px' }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Test Image Display</h5>
          <button className="btn btn-sm btn-outline-primary" onClick={addTestImage}>Add Test Image</button>
        </div>
        <div className="card-body">
          <div className="row">
            {files.slice(0, 5).map((file, index) => (
              <div key={index} className="col-md-4 mb-3">
                <div className="card">
                  <div className="card-header">
                    <small className="text-muted">{file}</small>
                  </div>
                  <div className="card-body text-center">
                    <ImageWithFallback
                      src={`uploads/${file}`}
                      alt={`File ${index + 1}`}
                      className="img-fluid"
                      style={{ maxHeight: '150px' }}
                    />
                  </div>
                  <div className="card-footer">
                    <small className="text-muted">Path: uploads/{file}</small>
                  </div>
                </div>
              </div>
            ))}

            {testImages.map((imageUrl, index) => (
              <div key={`test-${index}`} className="col-md-4 mb-3">
                <div className="card">
                  <div className="card-header">
                    <small className="text-muted">Custom Test Image {index + 1}</small>
                  </div>
                  <div className="card-body text-center">
                    <ImageWithFallback
                      src={imageUrl}
                      alt={`Test Image ${index + 1}`}
                      className="img-fluid"
                      style={{ maxHeight: '150px' }}
                    />
                  </div>
                  <div className="card-footer">
                    <small className="text-muted">Path: {imageUrl}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Test Image Component</h5>
        </div>
        <div className="card-body">
          <div className="row">
            {files.slice(0, 3).map((file, index) => (
              <div key={`test-component-${index}`} className="col-md-4 mb-3">
                <div className="card">
                  <div className="card-header">
                    <small className="text-muted">Test Image Component {index + 1}</small>
                  </div>
                  <div className="card-body text-center">
                    <TestImage
                      src={`uploads/${file}`}
                      alt={`Test Image ${index + 1}`}
                      width="100%"
                      height="150px"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-header">
          <h5 className="mb-0">Direct URL Tests</h5>
        </div>
        <div className="card-body">
          <div className="row">
            {files.slice(0, 3).map((file, index) => {
              // Get the API base URL from environment or use default
              const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';
              // Extract the server base URL (remove '/api' if present)
              const serverBaseUrl = apiBaseUrl.endsWith('/api')
                ? apiBaseUrl.substring(0, apiBaseUrl.length - 4)
                : apiBaseUrl;

              // Create multiple URL formats to try
              const directUrl = `${serverBaseUrl}/uploads/${file}`;
              const localhostUrl = `http://localhost:5002/uploads/${file}`;

              return (
                <div key={`direct-${index}`} className="col-md-4 mb-3">
                  <div className="card">
                    <div className="card-header">
                      <small className="text-muted">Direct URL Test {index + 1}</small>
                    </div>
                    <div className="card-body text-center">
                      <img
                        src={directUrl}
                        alt={`Direct URL Test ${index + 1}`}
                        className="img-fluid"
                        style={{ maxHeight: '150px' }}
                        onError={(e) => {
                          console.error('Direct URL image failed to load:', directUrl);
                          console.log('Trying localhost URL:', localhostUrl);
                          e.target.src = localhostUrl;

                          // Add a second error handler for the fallback URL
                          e.target.onerror = () => {
                            console.error('Localhost URL also failed:', localhostUrl);
                            e.target.src = 'https://via.placeholder.com/150x150?text=Load+Failed';
                            e.target.onerror = null; // Prevent infinite loop
                          };
                        }}
                      />
                    </div>
                    <div className="card-footer">
                      <div><small className="text-muted">Server URL: {directUrl}</small></div>
                      <div><small className="text-muted">Localhost URL: {localhostUrl}</small></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-header">
          <h5 className="mb-0">Common Issues & Solutions</h5>
        </div>
        <div className="card-body">
          <ul>
            <li><strong>CORS errors:</strong> Make sure the backend server has proper CORS headers set.</li>
            <li><strong>404 Not Found:</strong> Check if the image path is correct and the file exists on the server.</li>
            <li><strong>Path format:</strong> The path should be relative to the uploads directory or a full URL.</li>
            <li><strong>Server configuration:</strong> Ensure the server is correctly serving static files from the uploads directory.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageDebug;