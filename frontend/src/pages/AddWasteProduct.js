import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Meta from '../components/Meta';

const AddWasteProduct = () => {
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [availableDays, setAvailableDays] = useState({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false
  });

  // Check user authentication and role when component mounts
  React.useEffect(() => {
    const sessionToken = localStorage.getItem("sessionToken");
    const role = localStorage.getItem("role");

    if (!sessionToken) {
      setError("You must be logged in to add waste products");
      // Optional: Redirect to login page
      // navigate('/login');
    } else if (role !== 'farmer' && role !== 'industry') {
      setError("Only farmers and industry users can add waste products");
    }

    setUserRole(role || '');

    // Log authentication status for debugging
    console.log("Auth status:", {
      hasSessionToken: !!sessionToken,
      role: role
    });
  }, [navigate]);

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
    setLoading(true);
    setError(null);

    try {
      // Check if user is authenticated
      const sessionToken = localStorage.getItem("sessionToken");
      const role = localStorage.getItem("role");

      if (!sessionToken) {
        setError("You must be logged in to add a waste product. Please log in first with OTP verification.");
        setLoading(false);
        return;
      }

      // Check if user has the correct role
      if (role !== 'farmer' && role !== 'industry') {
        setError("Only farmers and industry users can add waste products. Your role is: " + (role || "not set"));
        setLoading(false);
        return;
      }

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

      // Add the image files to the FormData
      if (images.length > 0) {
        images.forEach(file => {
          formDataToSend.append('images', file);
        });
        console.log('Adding images:', images);
      } else {
        console.log('No images to upload');
      }

      // Log the FormData (for debugging)
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
      }

      // Debug authentication
      console.log("Authentication token being used:", sessionToken ? "Token exists" : "No token");
      console.log("User role:", localStorage.getItem("role"));

      if (!sessionToken) {
        throw new Error("Authentication token is missing. Please log in again with OTP verification.");
      }

      // Send request with FormData
      const response = await api.post('/waste-products', formDataToSend, {
        headers: {
          // Don't set Content-Type when sending FormData
          // The browser will automatically set the correct Content-Type with boundary
          Authorization: `Bearer ${sessionToken}`
        }
      });

      console.log("API Response:", response.data);

      alert('Waste product added successfully!');
      navigate(`/waste-products/${response.data.wasteProduct._id}`);
    } catch (err) {
      console.error('Error adding waste product:', err);

      // Handle different error scenarios
      if (err.message && err.message.includes("Authentication token is missing")) {
        setError("Authentication token is missing. Please log in again with OTP verification.");
      } else if (err.response?.status === 401) {
        setError("Authentication failed. Please log in again with OTP verification.");
      } else if (err.response?.status === 403) {
        setError("You don't have permission to add waste products. Only farmers and industry users can add waste products.");
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to add waste product. Please try again.');
      }

      // Log detailed error information for debugging
      console.log("Error details:", {
        message: err.message,
        status: err.response?.status,
        responseData: err.response?.data,
        authStatus: {
          sessionToken: !!localStorage.getItem("sessionToken"),
          role: localStorage.getItem("role")
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4 mb-5">
      <Meta title="Add Waste Product | Smart Agri System" />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Add Waste Product</h2>
        <Link to="/waste-management" className="btn btn-outline-secondary">
          Back to Waste Management
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger">
          <strong>Error:</strong> {error}
          {(error.includes("logged in") || error.includes("authentication")) && (
            <div className="mt-2">
              <Link to="/login" className="btn btn-sm btn-primary">
                Go to Login
              </Link>
            </div>
          )}
        </div>
      )}

      {userRole !== 'farmer' && userRole !== 'industry' && userRole !== '' && (
        <div className="alert alert-warning">
          <strong>Note:</strong> Only farmers and industry users can add waste products. Your current role is: {userRole}.
        </div>
      )}

      {loading && (
        <div className="text-center my-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Processing your request...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className={loading ? 'd-none' : ''}>
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
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="images" className="form-label">Product Images</label>
                  <input
                    type="file"
                    className="form-control"
                    id="images"
                    name="images"
                    onChange={handleImageChange}
                    multiple
                    accept="image/*"
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
                      />
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => removePossibleUse(index)}
                        disabled={formData.possibleUses.length === 1}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={addPossibleUse}
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
                        />
                        <span className="input-group-text">% Org</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Certifications */}
                <div className="mb-3">
                  <label className="form-label">Certifications (if any)</label>
                  {formData.certifications.map((cert, index) => (
                    <div key={index} className="input-group mb-2">
                      <input
                        type="text"
                        className="form-control"
                        value={cert}
                        onChange={(e) => handleCertificationChange(index, e.target.value)}
                        placeholder="E.g., Organic, ISO, etc."
                      />
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => removeCertification(index)}
                        disabled={formData.certifications.length === 1}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={addCertification}
                  >
                    <i className="bi bi-plus-circle me-1"></i> Add Certification
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
                    placeholder="Full address for pickup"
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
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="pickupDetails.phone" className="form-label">Contact Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      id="pickupDetails.phone"
                      name="pickupDetails.phone"
                      value={formData.pickupDetails.phone}
                      onChange={handleChange}
                      placeholder="Phone number for pickup coordination"
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Available Days for Pickup</label>
                  <div className="row g-2">
                    {Object.keys(availableDays).map(day => (
                      <div key={day} className="col-md-3 col-6">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={day}
                            name={day}
                            checked={availableDays[day]}
                            onChange={handleDayChange}
                          />
                          <label className="form-check-label" htmlFor={day}>
                            {day.charAt(0).toUpperCase() + day.slice(1)}
                          </label>
                        </div>
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
                    rows="3"
                    value={formData.pickupDetails.instructions}
                    onChange={handleChange}
                    placeholder="Any special instructions for pickup"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-lg-4">
            {/* Submission Card */}
            <div className="card border-0 shadow-sm mb-4 sticky-top" style={{ top: '20px' }}>
              <div className="card-header bg-white">
                <h4 className="mb-0">Submit Listing</h4>
              </div>
              <div className="card-body">
                <p>
                  <strong>Note:</strong> Fields marked with * are required. Please ensure all information is accurate.
                </p>
                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-success btn-lg"
                    disabled={loading || (userRole !== 'farmer' && userRole !== 'industry')}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Submitting...
                      </>
                    ) : (userRole !== 'farmer' && userRole !== 'industry') ? (
                      'Only Farmers and Industry Users Can Submit'
                    ) : (
                      'Submit Waste Product'
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/waste-management')}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
            
            {/* Guidelines Card */}
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white">
                <h4 className="mb-0">Listing Guidelines</h4>
              </div>
              <div className="card-body">
                <ul className="list-group list-group-flush">
                  <li className="list-group-item bg-transparent px-0">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    Provide accurate and detailed information
                  </li>
                  <li className="list-group-item bg-transparent px-0">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    Include clear images of the waste product
                  </li>
                  <li className="list-group-item bg-transparent px-0">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    Specify nutrient content if applicable
                  </li>
                  <li className="list-group-item bg-transparent px-0">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    Mention any certifications or quality standards
                  </li>
                  <li className="list-group-item bg-transparent px-0">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    Provide clear pickup instructions
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

export default AddWasteProduct;