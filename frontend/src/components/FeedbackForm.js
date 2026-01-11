import React, { useState } from 'react';
import api from '../api/axios';

const FeedbackForm = ({ productId, orderId }) => {
  const [formData, setFormData] = useState({
    type: 'suggestion',
    subject: '',
    message: '',
    rating: 5,
    relatedTo: productId || orderId || null,
    onModel: productId ? 'Product' : (orderId ? 'Order' : 'Platform'),
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
      [name]: name === 'rating' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await api.post('/feedback', formData);

      setSuccess(true);
      setFormData({
        type: 'suggestion',
        subject: '',
        message: '',
        rating: 5,
        relatedTo: productId || orderId || null,
        onModel: productId ? 'Product' : (orderId ? 'Order' : 'Platform')
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError(error.response?.data?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header bg-white">
        <h5 className="mb-0">Send Feedback</h5>
      </div>
      <div className="card-body">
        {success && (
          <div className="alert alert-success">
            Your feedback has been submitted successfully! Thank you for helping us improve.
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
              <div className="mb-3">
                <label htmlFor="type" className="form-label">Feedback Type</label>
                <select
                  className="form-select"
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="suggestion">Suggestion</option>
                  <option value="complaint">Complaint</option>
                  <option value="improvement">Improvement</option>
                  <option value="general">General Feedback</option>
                </select>
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="subject" className="form-label">Subject</label>
                <input
                  type="text"
                  className="form-control"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Brief subject of your feedback"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="col-md-3">
              <div className="mb-3">
                <label className="form-label">Rate Experience</label>
                <div className="star-rating d-flex">
                  {[1, 2, 3, 4, 5].map(star => (
                    <div key={star} className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="rating"
                        id={`rating${star}`}
                        value={star}
                        checked={parseInt(formData.rating) === star}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      <label className="form-check-label" htmlFor={`rating${star}`}>
                        <i className={`bi ${star <= formData.rating ? 'bi-star-fill' : 'bi-star'} text-warning`}></i>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-9">
              <div className="mb-3">
                <label htmlFor="message" className="form-label">Your Feedback</label>
                <textarea
                  className="form-control"
                  id="message"
                  name="message"
                  rows="3"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Please provide detailed feedback..."
                  required
                  disabled={loading}
                ></textarea>
              </div>
            </div>

            <div className="col-md-3 d-flex align-items-end">
              <button
                type="submit"
                className="btn btn-primary w-100 mb-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Submitting...
                  </>
                ) : 'Submit Feedback'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;
