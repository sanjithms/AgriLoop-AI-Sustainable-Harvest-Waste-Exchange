import React, { useState } from 'react';
import api from '../api/axios';

const ReviewForm = ({ productId, onReviewSubmitted }) => {
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
    qualityRating: 5,
    deliveryRating: 5,
    serviceRating: 5,
    name: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Rating') ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await api.post('/reviews', {
        productId,
        ...formData
      });

      setSuccess(true);
      setFormData({
        rating: 5,
        comment: '',
        qualityRating: 5,
        deliveryRating: 5,
        serviceRating: 5
      });

      // Call the callback function if provided
      if (onReviewSubmitted) {
        onReviewSubmitted(response.data);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setError(error.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStarRating = (name, value, label) => (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map(star => (
          <div key={star} className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name={name}
              id={`${name}${star}`}
              value={star}
              checked={parseInt(value) === star}
              onChange={handleChange}
              disabled={loading}
            />
            <label className="form-check-label" htmlFor={`${name}${star}`}>
              <i className={`bi ${star <= value ? 'bi-star-fill' : 'bi-star'} text-warning`}></i>
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header bg-white">
        <h5 className="mb-0">Write a Review</h5>
      </div>
      <div className="card-body">
        {success && (
          <div className="alert alert-success">
            Your review has been submitted successfully! Thank you for your feedback.
          </div>
        )}

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="horizontal-form">
          <div className="row align-items-center mb-3">
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Your Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Your Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="row align-items-center">
            <div className="col-md-3">
              {renderStarRating('rating', formData.rating, 'Overall Rating')}
            </div>

            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="comment" className="form-label">Your Review</label>
                <textarea
                  className="form-control"
                  id="comment"
                  name="comment"
                  rows="3"
                  value={formData.comment}
                  onChange={handleChange}
                  placeholder="Share your experience with this product..."
                  required
                  disabled={loading}
                ></textarea>
              </div>
            </div>

            <div className="col-md-3 text-center">
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Submitting...
                  </>
                ) : 'Submit Review'}
              </button>
            </div>
          </div>

          <div className="row mt-3">
            <div className="col-md-4">
              {renderStarRating('qualityRating', formData.qualityRating, 'Product Quality')}
            </div>
            <div className="col-md-4">
              {renderStarRating('deliveryRating', formData.deliveryRating, 'Delivery Experience')}
            </div>
            <div className="col-md-4">
              {renderStarRating('serviceRating', formData.serviceRating, 'Seller Service')}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;