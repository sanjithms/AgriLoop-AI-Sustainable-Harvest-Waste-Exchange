import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AgriQuestionAnswering = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAnswer('');
    setConfidence(0);
    
    try {
      const response = await axios.post(`${API_URL}/ai/answer-question`, { question });
      setAnswer(response.data.answer);
      setConfidence(response.data.confidence);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to get answer');
      console.error('Error getting answer:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="card mb-4">
      <div className="card-header">
        <h5 className="mb-0">Ask Agricultural Questions</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="question" className="form-label">Your Question</label>
            <input
              type="text"
              className="form-control"
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., What are the best practices for organic farming?"
              required
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
            Get Answer
          </button>
        </form>
        
        {error && (
          <div className="alert alert-danger mt-3" role="alert">
            {error}
          </div>
        )}
        
        {answer && (
          <div className="mt-4">
            <h6>Answer:</h6>
            <div className="p-3 bg-light rounded">
              <p>{answer}</p>
              <div className="mt-2 text-muted small">
                Confidence: {(confidence * 100).toFixed(2)}%
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgriQuestionAnswering;