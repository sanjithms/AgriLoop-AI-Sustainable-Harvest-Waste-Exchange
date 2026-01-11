import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Meta from '../components/Meta';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    businessName: '',
    businessType: '',
    businessDescription: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/profile');
      setUser(response.data);
      
      // Initialize form data with user data
      setFormData({
        name: response.data.name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        address: response.data.address?.street || '',
        city: response.data.address?.city || '',
        state: response.data.address?.state || '',
        postalCode: response.data.address?.postalCode || '',
        country: response.data.address?.country || 'India',
        businessName: response.data.businessName || '',
        businessType: response.data.businessType || '',
        businessDescription: response.data.businessDescription || ''
      });
      
      setError(null);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.put('/auth/profile', {
        name: formData.name,
        phone: formData.phone,
        address: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country
        },
        businessName: formData.businessName,
        businessType: formData.businessType,
        businessDescription: formData.businessDescription
      });
      
      setUser(response.data);
      setEditMode(false);
      alert('Profile updated successfully!');
      
      // Update localStorage if name changed
      if (formData.name !== localStorage.getItem('name')) {
        localStorage.setItem('name', formData.name);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }
    
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordSuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('Error changing password:', err);
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
        <Link to="/dashboard" className="btn btn-primary">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      <Meta title="My Profile | Smart Agri System" />
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Profile</h2>
        <Link to="/dashboard" className="btn btn-outline-secondary">
          Back to Dashboard
        </Link>
      </div>
      
      <div className="row">
        <div className="col-lg-4 mb-4">
          {/* Profile Card */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body text-center">
              <div className="mb-3">
                <div className="display-1 text-primary">
                  <i className="bi bi-person-circle"></i>
                </div>
              </div>
              <h4>{user?.name}</h4>
              <p className="text-muted mb-1">{user?.email}</p>
              <p className="text-muted mb-3">Role: {user?.role}</p>
              <button 
                className="btn btn-primary w-100"
                onClick={() => setEditMode(true)}
              >
                Edit Profile
              </button>
            </div>
          </div>
          
          {/* Account Actions */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Account Actions</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <Link to="/orders" className="btn btn-outline-secondary">
                  <i className="bi bi-bag me-2"></i> My Orders
                </Link>
                <Link to="/cart" className="btn btn-outline-secondary">
                  <i className="bi bi-cart me-2"></i> My Cart
                </Link>
                <button className="btn btn-outline-danger">
                  <i className="bi bi-box-arrow-right me-2"></i> Logout
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-8">
          {/* Profile Information */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Profile Information</h5>
              {!editMode && (
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setEditMode(true)}
                >
                  Edit
                </button>
              )}
            </div>
            <div className="card-body">
              {editMode ? (
                <form onSubmit={handleSubmit}>
                  <div className="row mb-3">
                    <div className="col-md-6 mb-3 mb-md-0">
                      <label htmlFor="name" className="form-label">Full Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="name" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="email" className="form-label">Email</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        id="email" 
                        value={formData.email}
                        disabled
                      />
                      <small className="text-muted">Email cannot be changed</small>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label">Phone Number</label>
                    <input 
                      type="tel" 
                      className="form-control" 
                      id="phone" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  
                  {(user?.role === 'farmer' || user?.role === 'industry') && (
                    <>
                      <h6 className="mt-4 mb-3">Business Information</h6>

                      <div className="mb-3">
                        <label htmlFor="businessName" className="form-label">
                          {user?.role === 'farmer' ? 'Farm Name' : 'Business Name'}
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="businessName"
                          name="businessName"
                          value={formData.businessName}
                          onChange={handleChange}
                        />
                      </div>

                      {user?.role === 'industry' && (
                        <div className="mb-3">
                          <label htmlFor="businessType" className="form-label">Business Type</label>
                          <select
                            className="form-select"
                            id="businessType"
                            name="businessType"
                            value={formData.businessType}
                            onChange={handleChange}
                          >
                            <option value="">Select Business Type</option>
                            <option value="Waste Processing">Waste Processing</option>
                            <option value="Recycling">Recycling</option>
                            <option value="Composting">Composting</option>
                            <option value="Manufacturing">Manufacturing</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      )}

                      <div className="mb-3">
                        <label htmlFor="businessDescription" className="form-label">Business Description</label>
                        <textarea
                          className="form-control"
                          id="businessDescription"
                          name="businessDescription"
                          value={formData.businessDescription}
                          onChange={handleChange}
                          rows="3"
                        />
                      </div>
                    </>
                  )}

                  <h6 className="mt-4 mb-3">Address Information</h6>

                  <div className="mb-3">
                    <label htmlFor="address" className="form-label">Street Address</label>
                    <input
                      type="text"
                      className="form-control"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6 mb-3 mb-md-0">
                      <label htmlFor="city" className="form-label">City</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="city" 
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="state" className="form-label">State</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="state" 
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6 mb-3 mb-md-0">
                      <label htmlFor="postalCode" className="form-label">Postal Code</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="postalCode" 
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="country" className="form-label">Country</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="country" 
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary"
                      onClick={() => setEditMode(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <p className="text-muted mb-1">Full Name</p>
                      <p className="fw-bold">{user?.name}</p>
                    </div>
                    <div className="col-md-6">
                      <p className="text-muted mb-1">Email</p>
                      <p className="fw-bold">{user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <p className="text-muted mb-1">Phone Number</p>
                      <p className="fw-bold">{user?.phone || 'Not provided'}</p>
                    </div>
                    <div className="col-md-6">
                      <p className="text-muted mb-1">Member Since</p>
                      <p className="fw-bold">
                        {user?.createdAt 
                          ? new Date(user.createdAt).toLocaleDateString() 
                          : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  
                  {(user?.role === 'farmer' || user?.role === 'industry') && (
                    <>
                      <h6 className="mt-4 mb-3">Business Information</h6>

                      <div className="row mb-4">
                        <div className="col-md-6">
                          <p className="text-muted mb-1">
                            {user?.role === 'farmer' ? 'Farm Name' : 'Business Name'}
                          </p>
                          <p className="fw-bold">{user?.businessName || 'Not provided'}</p>
                        </div>

                        {user?.role === 'industry' && (
                          <div className="col-md-6">
                            <p className="text-muted mb-1">Business Type</p>
                            <p className="fw-bold">{user?.businessType || 'Not specified'}</p>
                          </div>
                        )}
                      </div>

                      <div className="mb-4">
                        <p className="text-muted mb-1">Business Description</p>
                        <p>{user?.businessDescription || 'No description provided'}</p>
                      </div>
                    </>
                  )}

                  <h6 className="mt-4 mb-3">Address Information</h6>

                  {user?.address?.street ? (
                    <div>
                      <p className="mb-1">{user.address.street}</p>
                      <p className="mb-1">
                        {user.address.city}, {user.address.state} {user.address.postalCode}
                      </p>
                      <p>{user.address.country}</p>
                    </div>
                  ) : (
                    <p className="text-muted">No address information provided</p>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Change Password */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Change Password</h5>
            </div>
            <div className="card-body">
              {passwordError && (
                <div className="alert alert-danger">{passwordError}</div>
              )}
              
              {passwordSuccess && (
                <div className="alert alert-success">{passwordSuccess}</div>
              )}
              
              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-3">
                  <label htmlFor="currentPassword" className="form-label">Current Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    id="currentPassword" 
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label">New Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    id="newPassword" 
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength="6"
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    id="confirmPassword" 
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength="6"
                  />
                </div>
                
                <button type="submit" className="btn btn-primary">
                  Change Password
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;