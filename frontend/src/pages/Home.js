import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Meta from "../components/Meta";

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await api.get('/products?limit=4');

        // Handle both formats: array or {products: [...]}
        const productsData = response.data.products || response.data;
        setFeaturedProducts(productsData);

        // Extract unique categories
        const uniqueCategories = [...new Set(productsData.map(product => product.category))];
        setCategories(uniqueCategories.length > 0 ? uniqueCategories : ['Seeds', 'Fertilizer', 'Equipment', 'Waste Product']);
      } catch (error) {
        console.error('Error fetching featured products:', error);
        // Set default categories if fetch fails
        setCategories(['Seeds', 'Fertilizer', 'Equipment', 'Waste Product']);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <>
      <Meta
        title="Smart Agri System | Home"
        description="Smart Agricultural Product & Waste Management System - Connecting Farmers, Buyers & Waste Recyclers for a sustainable agricultural ecosystem"
        keywords="agriculture, farming, waste management, organic products, fertilizers, seeds, equipment, recycling"
      />
      {/* Hero Section */}
      <div className="bg-success text-white py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h1 className="display-4 fw-bold">Smart Agricultural Product & Waste Management</h1>
              <p className="lead">Connecting Farmers, Buyers & Waste Recyclers for a sustainable agricultural ecosystem</p>
              <div className="d-flex gap-3 mt-4">
                <Link to="/products" className="btn btn-light btn-lg">
                  Shop Now
                </Link>
                <Link to="/waste" className="btn btn-outline-light btn-lg">
                  Explore Waste Products
                </Link>
              </div>
            </div>
            <div className="col-md-6 d-none d-md-block">
              <img
                src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                alt="Agriculture"
                className="img-fluid rounded"
                style={{ maxHeight: '400px', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="container mt-5">
        <h2 className="text-center mb-4">Shop by Category</h2>
        <div className="row">
          {categories.map((category, index) => (
            <div key={index} className="col-6 col-md-3 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <i className={`bi bi-${getCategoryIcon(category)} fs-1 text-success mb-3`}></i>
                  <h5 className="card-title">{category}</h5>
                  <Link to={`/products?category=${category}`} className="stretched-link"></Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="container mt-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Featured Products</h2>
          <Link to="/products" className="btn btn-outline-success">
            View All
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="row">
            {featuredProducts.map(product => (
              <div key={product._id} className="col-md-3 mb-4">
                <div className="card h-100">
                  {product.image ? (
                    <img
                      src={product.image.startsWith('http')
                        ? product.image
                        : `http://localhost:5002/uploads/${product.image.replace('uploads/', '')}`}
                      className="card-img-top"
                      alt={product.name}
                      style={{ height: '200px', objectFit: 'cover' }}
                      onError={(e) => {
                        console.error('Image failed to load:', product.image);
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="bg-light text-center py-5">
                      <i className="bi bi-image text-muted" style={{ fontSize: '3rem' }}></i>
                    </div>
                  )}
                  <div className="card-body">
                    <h5 className="card-title">{product.name}</h5>
                    <p className="card-text text-success fw-bold">₹{product.price}</p>
                    <Link to={`/product/${product._id}`} className="btn btn-outline-primary btn-sm">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Tools Section */}
      <div className="py-5 mt-5">
        <div className="container">
          <h2 className="text-center mb-5">AI-Powered Agricultural Tools</h2>

          <div className="row align-items-center mb-5">
            <div className="col-md-6">
              <h3 className="mb-3">Agricultural Waste Analyzer</h3>
              <p className="lead mb-4">
                Discover the hidden value in your agricultural waste. Our AI-powered waste analyzer helps you identify potential uses, processing methods, and market value for various types of agricultural waste.
              </p>
              <Link to="/waste-analyzer" className="btn btn-success">
                <i className="bi bi-search me-2"></i>
                Try Waste Analyzer
              </Link>
            </div>
            <div className="col-md-6">
              <div className="card border-0 shadow-lg">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-4">
                    <div className="bg-success p-3 rounded-circle me-3">
                      <i className="bi bi-recycle text-white fs-3"></i>
                    </div>
                    <h4 className="mb-0">Turn Waste into Value</h4>
                  </div>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item border-0 d-flex align-items-center">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      Identify optimal uses for agricultural waste
                    </li>
                    <li className="list-group-item border-0 d-flex align-items-center">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      Learn processing methods to increase value
                    </li>
                    <li className="list-group-item border-0 d-flex align-items-center">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      Discover market opportunities and pricing
                    </li>
                    <li className="list-group-item border-0 d-flex align-items-center">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      Upload images for instant waste classification
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="row align-items-center mt-5 flex-md-row-reverse">
            <div className="col-md-6">
              <h3 className="mb-3">AI Agricultural Advisor</h3>
              <p className="lead mb-4">
                Get expert advice on crop selection, pest management, soil health, water management, market trends, and agricultural technology. Our AI advisor provides personalized recommendations based on your specific needs.
              </p>
              <Link to="/ai-advisor" className="btn btn-primary">
                <i className="bi bi-robot me-2"></i>
                Ask AI Advisor
              </Link>
            </div>
            <div className="col-md-6">
              <div className="card border-0 shadow-lg">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-4">
                    <div className="bg-primary p-3 rounded-circle me-3">
                      <i className="bi bi-lightbulb text-white fs-3"></i>
                    </div>
                    <h4 className="mb-0">Smart Farming Assistant</h4>
                  </div>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item border-0 d-flex align-items-center">
                      <i className="bi bi-check-circle-fill text-primary me-2"></i>
                      Get expert advice on crop selection and management
                    </li>
                    <li className="list-group-item border-0 d-flex align-items-center">
                      <i className="bi bi-check-circle-fill text-primary me-2"></i>
                      Learn sustainable pest control methods
                    </li>
                    <li className="list-group-item border-0 d-flex align-items-center">
                      <i className="bi bi-check-circle-fill text-primary me-2"></i>
                      Improve soil health and water management
                    </li>
                    <li className="list-group-item border-0 d-flex align-items-center">
                      <i className="bi bi-check-circle-fill text-primary me-2"></i>
                      Stay updated on market trends and technologies
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="bg-light py-5">
        <div className="container">
          <h2 className="text-center mb-4">Why Choose Us</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <i className="bi bi-truck text-success fs-1 mb-3"></i>
                  <h4>Fast Delivery</h4>
                  <p className="text-muted">We deliver your products directly from farmers to your doorstep.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <i className="bi bi-shield-check text-success fs-1 mb-3"></i>
                  <h4>Quality Assurance</h4>
                  <p className="text-muted">All our products are verified for quality and freshness.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <i className="bi bi-recycle text-success fs-1 mb-3"></i>
                  <h4>Sustainable Practices</h4>
                  <p className="text-muted">We promote waste recycling and sustainable agricultural practices.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="container mt-5 mb-5 text-center">
        <div className="p-5 bg-success text-white rounded">
          <h2>Ready to start shopping?</h2>
          <p className="lead">Browse our wide range of agricultural products and waste management solutions.</p>
          <Link to="/products" className="btn btn-light btn-lg mt-3">
            Shop Now
          </Link>
        </div>
      </div>
    </>
  );
};

// Helper function to get icon for category
const getCategoryIcon = (category) => {
  switch (category.toLowerCase()) {
    case 'fertilizer':
      return 'droplet';
    case 'seeds':
      return 'flower1';
    case 'equipment':
      return 'tools';
    case 'waste product':
      return 'recycle';
    default:
      return 'box';
  }
};

export default Home;
