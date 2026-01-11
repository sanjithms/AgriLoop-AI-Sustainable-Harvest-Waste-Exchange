import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import App from './App';
import { updateCartBadge } from './utils/cartUtils';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Initialize cart badge when the app loads
document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit to ensure the navbar is loaded
  setTimeout(() => {
    updateCartBadge();
  }, 500);
});
