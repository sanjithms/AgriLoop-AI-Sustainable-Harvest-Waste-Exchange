import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-dark text-white mt-5 py-4">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-4 mb-md-0">
            <h5>Smart Agri System</h5>
            <p className="text-muted">
              Connecting farmers, buyers, and waste recyclers for a sustainable agricultural ecosystem.
            </p>
            <div className="social-icons">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white me-3">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white me-3">
                <i className="bi bi-twitter"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white me-3">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-white">
                <i className="bi bi-linkedin"></i>
              </a>
            </div>
          </div>
          
          <div className="col-md-2 mb-4 mb-md-0">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-decoration-none text-muted">Home</Link>
              </li>
              <li className="mb-2">
                <Link to="/products" className="text-decoration-none text-muted">Products</Link>
              </li>
              <li className="mb-2">
                <Link to="/awareness-page" className="text-decoration-none text-muted">Waste Awareness</Link>
              </li>
              <li className="mb-2">
                <Link to="/cart" className="text-decoration-none text-muted">Cart</Link>
              </li>
            </ul>
          </div>
          
          <div className="col-md-2 mb-4 mb-md-0">
            <h5>Account</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/login" className="text-decoration-none text-muted">Login</Link>
              </li>
              <li className="mb-2">
                <Link to="/register" className="text-decoration-none text-muted">Register</Link>
              </li>
              <li className="mb-2">
                <Link to="/dashboard" className="text-decoration-none text-muted">Dashboard</Link>
              </li>
            </ul>
          </div>
          
          <div className="col-md-4">
            <h5>Contact Us</h5>
            <address className="text-muted">
              <p><i className="bi bi-geo-alt me-2"></i> 123 Agriculture Road, Farmville</p>
              <p><i className="bi bi-envelope me-2"></i> info@smartagrisystem.com</p>
              <p><i className="bi bi-telephone me-2"></i> +91 1234567890</p>
            </address>
          </div>
        </div>
        
        <hr className="my-4 bg-secondary" />
        
        <div className="row">
          <div className="col-md-6 text-center text-md-start">
            <p className="mb-0 text-muted">
              &copy; {currentYear} Smart Agri System. All rights reserved.
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <ul className="list-inline mb-0">
              <li className="list-inline-item">
                <Link to="/privacy-policy" className="text-decoration-none text-muted">Privacy Policy</Link>
              </li>
              <li className="list-inline-item mx-3">
                <Link to="/terms-of-service" className="text-decoration-none text-muted">Terms of Service</Link>
              </li>
              <li className="list-inline-item">
                <Link to="/faq" className="text-decoration-none text-muted">FAQ</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;