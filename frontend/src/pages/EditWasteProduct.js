import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Meta from '../components/Meta';

// Helper function to get proper image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://via.placeholder.com/400x300?text=No+Image';
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) return imagePath;
  // If it's a local path starting with uploads/, remove the prefix
  const filename = imagePath.replace('uploads/', '').split('/').pop();
  // Construct the full URL using the backend URL
  return `${process.env.REACT_APP_API_URL.replace('/api', '')}/uploads/${filename}`;
};

const EditWasteProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    quantity: '',
    unit: 'kg',
    price: '',
    location: '',
    possibleUses: [''],
    nutrientContent: {
      nitrogen: '',
      phosphorus: '',
      potassium: '',
      organic: ''
    },
    certifications: [''],
    pickupDetails: {
      address: '',
      contactPerson: '',
      phone: '',
      availableDays: [],
      instructions: ''
    }
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [availableDays, setAvailableDays] = useState({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false
  });
  const [currentImages, setCurrentImages] = useState([]);

  useEffect(() => {
    // Define fetchWasteProduct inside useEffect to avoid dependency issues
    const fetchWasteProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/waste-products/${id}`);
        const product = response.data.wasteProduct;
        
        // Set form data from product
        setFormData({
          name: product.name || '',
          description: product.description || '',
          type: product.type || '',
          quantity: product.quantity || 0,
          unit: product.unit || 'kg',
          price: product.price || 0,
          location: product.location || '',
          availability: product.availability || {
            monday: false,
            tuesday: false,
            wednesday: false,
            thursday: false,
            friday: false,
            saturday: false,
            sunday: false
          }
        });
        
        // Set current images
        setCurrentImages(product.images || []);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching waste product:', err);
        setError('Failed to load waste product. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWasteProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleNutrientChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      nutrientContent: {
        ...prev.nutrientContent,
        [name]: value
      }
    }));
  };

  const handlePossibleUsesChange = (index, value) => {
    const newPossibleUses = [...formData.possibleUses];
    newPossibleUses[index] = value;
    setFormData(prev => ({
      ...prev,
      possibleUses: newPossibleUses
    }));
  };

  const addPossibleUse = () => {
    setFormData(prev => ({
      ...prev,
      possibleUses: [...prev.possibleUses, '']
    }));
  };

  const removePossibleUse = (index) => {
    const newPossibleUses = [...formData.possibleUses];
    newPossibleUses.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      possibleUses: newPossibleUses
    }));
  };

  const handleCertificationChange = (index, value) => {
    const newCertifications = [...formData.certifications];
    newCertifications[index] = value;
    setFormData(prev => ({
      ...prev,
      certifications: newCertifications
    }));
  };

  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, '']
    }));
  };

  const removeCertification = (index) => {
    const newCertifications = [...formData.certifications];
    newCertifications.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      certifications: newCertifications
    }));
  };

  const handleDayChange = (e) => {
    const { name, checked } = e.target;
    setAvailableDays(prev => ({
      ...prev,
      [name]: checked
    }));
    
    // Update formData with selected days
    const selectedDays = Object.keys(availableDays).filter(day => 
      day === name ? checked : availableDays[day]
    ).map(day => day.charAt(0).toUpperCase() + day.slice(1));
    
    setFormData(prev => ({
      ...prev,
      pickupDetails: {
        ...prev.pickupDetails,
        availableDays: selectedDays
      }
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Filter out empty values
      const cleanedFormData = {
        ...formData,
        possibleUses: formData.possibleUses.filter(use => use.trim() !== ''),
        certifications: formData.certifications.filter(cert => cert.trim() !== '')
      };

      // Clean nutrient content
      const nutrientContent = {};
      for (const [key, value] of Object.entries(cleanedFormData.nutrientContent)) {
        if (value !== '') {
          nutrientContent[key] = Number(value);
        }
      }
      cleanedFormData.nutrientContent = nutrientContent;

      // Create a FormData object to handle file uploads
      const formDataToSend = new FormData();

      // Add basic fields
      formDataToSend.append('name', cleanedFormData.name);
      formDataToSend.append('description', cleanedFormData.description);
      formDataToSend.append('type', cleanedFormData.type);
      formDataToSend.append('quantity', cleanedFormData.quantity);
      formDataToSend.append('unit', cleanedFormData.unit);
      formDataToSend.append('price', cleanedFormData.price);
      formDataToSend.append('location', cleanedFormData.location);

      // Add nutrient content as JSON string
      formDataToSend.append('nutrientContent', JSON.stringify(nutrientContent));

      // Add pickup details as JSON string
      formDataToSend.append('pickupDetails', JSON.stringify(cleanedFormData.pickupDetails));

      // Add arrays
      if (cleanedFormData.possibleUses && cleanedFormData.possibleUses.length > 0) {
        formDataToSend.append('possibleUses', JSON.stringify(cleanedFormData.possibleUses));
      }

      if (cleanedFormData.certifications && cleanedFormData.certifications.length > 0) {
        formDataToSend.append('certifications', JSON.stringify(cleanedFormData.certifications));
      }

      // Add the image files to the FormData if new images are selected
      if (images.length > 0) {
        images.forEach(file => {
          formDataToSend.append('images', file);
        });
        console.log('Adding new images:', images);
      } else {
        console.log('No new images to upload');
      }

      // Log the FormData (for debugging)
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
      }

      // The token is automatically added by the axios interceptor
      // No need to manually add it here

      // Send request with FormData
      await api.put(`/waste-products/${id}`, formDataToSend, {
        headers: {
          // Don't set Content-Type when sending FormData
          // The browser will automatically set the correct Content-Type with boundary
        }
      });
      
      alert('Waste product updated successfully!');
      navigate(`/waste-products/${id}`);
    } catch (err) {
      console.error('Error updating waste product:', err);
      setError(err.response?.data?.message || 'Failed to update waste product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading waste product details...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      <Meta title="Edit Waste Product | Smart Agri System" />
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Edit Waste Product</h2>
        <Link to={`/waste-products/${id}`} className="btn btn-outline-secondary">
          Cancel
        </Link>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-8">
            {/* Basic Information */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white">
                <h4 className="mb-0">Basic Information</h4>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Product Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="E.g., Rice Husk, Cow Manure, etc."
                    disabled={submitting}
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description *</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    placeholder="Provide a detailed description of your waste product..."
                    disabled={submitting}
                  ></textarea>
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="type" className="form-label">Waste Type *</label>
                    <select
                      className="form-select"
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                      disabled={submitting}
                    >
                      <option value="">Select Waste Type</option>
                      <option value="Crop Residue">Crop Residue</option>
                      <option value="Animal Waste">Animal Waste</option>
                      <option value="Processing Waste">Processing Waste</option>
                      <option value="Organic Waste">Organic Waste</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="location" className="form-label">Location *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      placeholder="City, State"
                      disabled={submitting}
                    />
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-4">
                    <label htmlFor="quantity" className="form-label">Quantity *</label>
                    <input
                      type="number"
                      className="form-control"
                      id="quantity"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                      min="1"
                      step="0.01"
                      disabled={submitting}
                    />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="unit" className="form-label">Unit *</label>
                    <select
                      className="form-select"
                      id="unit"
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      required
                      disabled={submitting}
                    >
                      <option value="kg">Kilograms (kg)</option>
                      <option value="ton">Tons</option>
                      <option value="liters">Liters</option>
                      <option value="pieces">Pieces</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="price" className="form-label">Price per {formData.unit} *</label>
                    <div className="input-group">
                      <span className="input-group-text">₹</span>
                      <input
                        type="number"
                        className="form-control"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                        disabled={submitting}
                      />
                    </div>
                  </div>
                </div>
                
                {currentImages.length > 0 && (
                  <div className="mb-3">
                    <label className="form-label">Current Images</label>
                    <div className="d-flex flex-wrap gap-2">
                      {currentImages.map((image, index) => (
                        <div key={index} className="position-relative">
                          <img 
                            src={getImageUrl(image)}
                            alt={`Product ${index + 1}`}
                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                            className="rounded"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/100?text=Error';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    <small className="text-muted d-block mt-1">
                      Note: Uploading new images will replace the current ones
                    </small>
                  </div>
                )}
                
                <div className="mb-3">
                  <label htmlFor="images" className="form-label">Upload New Images</label>
                  <input
                    type="file"
                    className="form-control"
                    id="images"
                    name="images"
                    onChange={handleImageChange}
                    multiple
                    accept="image/*"
                    disabled={submitting}
                  />
                  <small className="text-muted">You can select multiple images (max 5)</small>
                </div>
              </div>
            </div>
            
            {/* Additional Information */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white">
                <h4 className="mb-0">Additional Information</h4>
              </div>
              <div className="card-body">
                {/* Possible Uses */}
                <div className="mb-4">
                  <label className="form-label">Possible Uses</label>
                  {formData.possibleUses.map((use, index) => (
                    <div key={index} className="input-group mb-2">
                      <input
                        type="text"
                        className="form-control"
                        value={use}
                        onChange={(e) => handlePossibleUsesChange(index, e.target.value)}
                        placeholder="E.g., Composting, Animal Bedding, etc."
                        disabled={submitting}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => removePossibleUse(index)}
                        disabled={formData.possibleUses.length === 1 || submitting}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={addPossibleUse}
                    disabled={submitting}
                  >
                    <i className="bi bi-plus-circle me-1"></i> Add Another Use
                  </button>
                </div>
                
                {/* Nutrient Content */}
                <div className="mb-4">
                  <label className="form-label">Nutrient Content (if applicable)</label>
                  <div className="row g-3">
                    <div className="col-md-3 col-6">
                      <div className="input-group">
                        <input
                          type="number"
                          className="form-control"
                          id="nitrogen"
                          name="nitrogen"
                          value={formData.nutrientContent.nitrogen}
                          onChange={handleNutrientChange}
                          placeholder="N %"
                          min="0"
                          max="100"
                          step="0.01"
                          disabled={submitting}
                        />
                        <span className="input-group-text">% N</span>
                      </div>
                    </div>
                    <div className="col-md-3 col-6">
                      <div className="input-group">
                        <input
                          type="number"
                          className="form-control"
                          id="phosphorus"
                          name="phosphorus"
                          value={formData.nutrientContent.phosphorus}
                          onChange={handleNutrientChange}
                          placeholder="P %"
                          min="0"
                          max="100"
                          step="0.01"
                          disabled={submitting}
                        />
                        <span className="input-group-text">% P</span>
                      </div>
                    </div>
                    <div className="col-md-3 col-6">
                      <div className="input-group">
                        <input
                          type="number"
                          className="form-control"
                          id="potassium"
                          name="potassium"
                          value={formData.nutrientContent.potassium}
                          onChange={handleNutrientChange}
                          placeholder="K %"
                          min="0"
                          max="100"
                          step="0.01"
                          disabled={submitting}
                        />
                        <span className="input-group-text">% K</span>
                      </div>
                    </div>
                    <div className="col-md-3 col-6">
                      <div className="input-group">
                        <input
                          type="number"
                          className="form-control"
                          id="organic"
                          name="organic"
                          value={formData.nutrientContent.organic}
                          onChange={handleNutrientChange}
                          placeholder="Organic %"
                          min="0"
                          max="100"
                          step="0.01"
                          disabled={submitting}
                        />
                        <span className="input-group-text">% Org</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Certifications */}
                <div className="mb-4">
                  <label className="form-label">Certifications (if applicable)</label>
                  {formData.certifications.map((cert, index) => (
                    <div key={index} className="input-group mb-2">
                      <input
                        type="text"
                        className="form-control"
                        value={cert}
                        onChange={(e) => handleCertificationChange(index, e.target.value)}
                        placeholder="E.g., Organic, ISO, etc."
                        disabled={submitting}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => removeCertification(index)}
                        disabled={formData.certifications.length === 1 || submitting}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={addCertification}
                    disabled={submitting}
                  >
                    <i className="bi bi-plus-circle me-1"></i> Add Another Certification
                  </button>
                </div>
              </div>
            </div>
            
            {/* Pickup Details */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white">
                <h4 className="mb-0">Pickup Details</h4>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label htmlFor="pickupDetails.address" className="form-label">Pickup Address</label>
                  <textarea
                    className="form-control"
                    id="pickupDetails.address"
                    name="pickupDetails.address"
                    rows="2"
                    value={formData.pickupDetails.address}
                    onChange={handleChange}
                    placeholder="Enter detailed pickup address"
                    disabled={submitting}
                  ></textarea>
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="pickupDetails.contactPerson" className="form-label">Contact Person</label>
                    <input
                      type="text"
                      className="form-control"
                      id="pickupDetails.contactPerson"
                      name="pickupDetails.contactPerson"
                      value={formData.pickupDetails.contactPerson}
                      onChange={handleChange}
                      placeholder="Name of contact person"
                      disabled={submitting}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="pickupDetails.phone" className="form-label">Contact Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      id="pickupDetails.phone"
                      name="pickupDetails.phone"
                      value={formData.pickupDetails.phone}
                      onChange={handleChange}
                      placeholder="Phone number for pickup coordination"
                      disabled={submitting}
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Available Days for Pickup</label>
                  <div className="d-flex flex-wrap gap-3">
                    {Object.keys(availableDays).map((day) => (
                      <div key={day} className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={day}
                          name={day}
                          checked={availableDays[day]}
                          onChange={handleDayChange}
                          disabled={submitting}
                        />
                        <label className="form-check-label" htmlFor={day}>
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="pickupDetails.instructions" className="form-label">Special Instructions</label>
                  <textarea
                    className="form-control"
                    id="pickupDetails.instructions"
                    name="pickupDetails.instructions"
                    rows="2"
                    value={formData.pickupDetails.instructions}
                    onChange={handleChange}
                    placeholder="Any special instructions for pickup"
                    disabled={submitting}
                  ></textarea>
                </div>
              </div>
            </div>
            
            <div className="d-grid gap-2">
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Updating...
                  </>
                ) : (
                  'Update Waste Product'
                )}
              </button>
            </div>
          </div>
          
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm mb-4 sticky-top" style={{ top: '20px' }}>
              <div className="card-header bg-white">
                <h4 className="mb-0">Tips</h4>
              </div>
              <div className="card-body">
                <ul className="list-group list-group-flush">
                  <li className="list-group-item bg-transparent">
                    <i className="bi bi-info-circle-fill text-primary me-2"></i>
                    Provide accurate details to attract potential buyers
                  </li>
                  <li className="list-group-item bg-transparent">
                    <i className="bi bi-image text-primary me-2"></i>
                    Clear images help buyers understand your product better
                  </li>
                  <li className="list-group-item bg-transparent">
                    <i className="bi bi-geo-alt-fill text-primary me-2"></i>
                    Specific location details make pickup coordination easier
                  </li>
                  <li className="list-group-item bg-transparent">
                    <i className="bi bi-recycle text-primary me-2"></i>
                    Mention all possible uses to reach a wider audience
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditWasteProduct;