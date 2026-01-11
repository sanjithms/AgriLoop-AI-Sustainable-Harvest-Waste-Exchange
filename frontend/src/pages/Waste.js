import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Meta from '../components/Meta';
import OptimizedImage from '../components/OptimizedImage';
import { updateCartBadge } from '../utils/cartUtils';
import { getImageUrl } from '../utils/imageUtils';

const Waste = () => {
  const [wasteProducts, setWasteProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    minPrice: '',
    maxPrice: '',
    location: '',
    search: ''
  });
  const [sort, setSort] = useState('createdAt:desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchWasteProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sort, currentPage]);

  const fetchWasteProducts = async () => {
    try {
      setLoading(true);
      console.log("Fetching waste products...");

      // Build query string
      let queryString = `?page=${currentPage}&sort=${sort}`;
      if (filters.type) queryString += `&type=${filters.type}`;
      if (filters.minPrice) queryString += `&minPrice=${filters.minPrice}`;
      if (filters.maxPrice) queryString += `&maxPrice=${filters.maxPrice}`;
      if (filters.location) queryString += `&location=${filters.location}`;
      if (filters.search) queryString += `&search=${filters.search}`;

      console.log("Query string:", queryString);
      console.log("API URL:", api.defaults.baseURL);
      
      // First try to check if the API is reachable
      try {
        await api.get('/health-check', { timeout: 3000 });
      } catch (healthCheckErr) {
        console.error('Health check failed:', healthCheckErr);
        // Continue anyway, the main request might still work
      }
      
      const response = await api.get(`/waste-products${queryString}`);
      console.log("Waste products response:", response.data);

      if (response.data && response.data.wasteProducts) {
        setWasteProducts(response.data.wasteProducts);
        setTotalPages(response.data.totalPages || 1);
      } else if (Array.isArray(response.data)) {
        // Handle case where API returns array directly
        setWasteProducts(response.data);
        setTotalPages(1);
      } else if (response.data && Array.isArray(response.data.data)) {
        // Handle case where API returns { data: [...] }
        setWasteProducts(response.data.data);
        setTotalPages(response.data.totalPages || 1);
      } else {
        console.warn("Unexpected response format:", response.data);
        setWasteProducts([]);
        setTotalPages(1);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching waste products:', err);
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
        setError(`Failed to load waste products: ${err.response.data.message || err.message}`);
      } else if (err.request) {
        console.error('No response received:', err.request);
        setError('Failed to load waste products: No response from server. Please check your connection.');
      } else {
        console.error('Error message:', err.message);
        setError(`Failed to load waste products: ${err.message}`);
      }
      setWasteProducts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
    setCurrentPage(1); // Reset to first page when sort changes
  };

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when search is submitted
    // No need to call fetchWasteProducts() here as it will be triggered by the useEffect
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      minPrice: '',
      maxPrice: '',
      location: '',
      search: ''
    });
    setSort('createdAt:desc');
    setCurrentPage(1);
  };

  return (
    <div className="container mt-4 mb-5">
      <Meta title="Wastes | Smart Agri System" />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Wastes</h2>
        <div className="d-flex gap-2">
          <Link to="/waste-products/add" className="btn btn-success">
            <i className="bi bi-plus-circle me-2"></i>
            List Waste Product
          </Link>
        </div>
      </div>
      
      <div className="row mb-4">
        <div className="col-lg-3">
          {/* Filters Card */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">Filters</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="type" className="form-label">Waste Type</label>
                <select 
                  id="type" 
                  name="type" 
                  className="form-select"
                  value={filters.type}
                  onChange={handleFilterChange}
                >
                  <option value="">All Types</option>
                  <option value="Crop Residue">Crop Residue</option>
                  <option value="Animal Waste">Animal Waste</option>
                  <option value="Processing Waste">Processing Waste</option>
                  <option value="Organic Waste">Organic Waste</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Price Range (₹)</label>
                <div className="d-flex gap-2">
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="Min"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    min="0"
                  />
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="Max"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    min="0"
                  />
                </div>
              </div>
              
              <div className="mb-3">
                <label htmlFor="location" className="form-label">Location</label>
                <input 
                  type="text" 
                  id="location" 
                  name="location" 
                  className="form-control"
                  placeholder="Enter city or region"
                  value={filters.location}
                  onChange={handleFilterChange}
                />
              </div>
              
              <button 
                className="btn btn-outline-secondary w-100"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </div>
          </div>
          
          {/* Information Card */}
          <div className="card shadow-sm bg-light">
            <div className="card-body">
              <h5 className="card-title">Why Recycle Agricultural Waste?</h5>
              <p className="card-text small">
                Agricultural waste recycling helps reduce environmental impact, creates additional income streams, and promotes sustainable farming practices.
              </p>
            </div>
          </div>
        </div>
        
        <div className="col-lg-9">
          {/* Search and Sort Controls */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <form onSubmit={handleSearchSubmit}>
                    <div className="input-group">
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Search waste products..."
                        value={filters.search}
                        onChange={handleSearchChange}
                      />
                      <button className="btn btn-outline-secondary" type="submit">
                        <i className="bi bi-search"></i>
                      </button>
                    </div>
                  </form>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center justify-content-md-end">
                    <label htmlFor="sort" className="me-2 text-nowrap">Sort by:</label>
                    <select 
                      id="sort" 
                      className="form-select w-auto"
                      value={sort}
                      onChange={handleSortChange}
                    >
                      <option value="createdAt:desc">Newest First</option>
                      <option value="createdAt:asc">Oldest First</option>
                      <option value="price:asc">Price: Low to High</option>
                      <option value="price:desc">Price: High to Low</option>
                      <option value="name:asc">Name: A to Z</option>
                      <option value="name:desc">Name: Z to A</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Results Section */}
          {error && (
            <div className="alert alert-danger">{error}</div>
          )}
          
          {loading ? (
            <div className="text-center my-5">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading waste products...</p>
            </div>
          ) : wasteProducts.length === 0 ? (
            <div className="text-center my-5">
              <div className="mb-4">
                <i className="bi bi-recycle text-muted" style={{ fontSize: '4rem' }}></i>
              </div>
              <h4>No waste products found</h4>
              <p className="text-muted">Try adjusting your filters or check back later.</p>
            </div>
          ) : (
            <>
              {/* Waste Products Grid */}
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {wasteProducts.map(product => (
                  <div key={product._id} className="col">
                    <div className="card h-100 border-0 shadow-sm">
                      {product.images && product.images.length > 0 ? (
                        <OptimizedImage
                          src={getImageUrl(product.images[0])}
                          className="card-img-top"
                          alt={product.name}
                          style={{ height: '200px', objectFit: 'cover' }}
                          fallbackSrc="https://via.placeholder.com/400x300?text=No+Image"
                        />
                      ) : (
                        <div className="bg-light text-center py-5">
                          <i className="bi bi-image text-muted" style={{ fontSize: '3rem' }}></i>
                        </div>
                      )}
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h5 className="card-title mb-0">{product.name}</h5>
                          <span className="badge bg-success">{product.type}</span>
                        </div>
                        <p className="card-text text-truncate">{product.description}</p>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-bold text-success">₹{product.price}/{product.unit}</span>
                          <span className="text-muted small">{product.quantity} {product.unit} available</span>
                        </div>
                        <p className="card-text small mb-0">
                          <i className="bi bi-geo-alt me-1"></i> {product.location}
                        </p>
                      </div>
                      <div className="card-footer bg-white border-top-0">
                        <div className="d-flex gap-2">
                          <Link to={`/waste-products/${product._id}`} className="btn btn-outline-primary flex-grow-1">
                            View Details
                          </Link>
                          <button
                            className="btn btn-success"
                            onClick={(e) => {
                              e.preventDefault();
                              // Add to cart logic
                              const token = localStorage.getItem('token');
                              const sessionToken = localStorage.getItem('sessionToken');
                              const isAuthenticated = token || sessionToken;
                              
                              const cartItem = {
                                _id: product._id,
                                name: product.name,
                                price: product.price,
                                image: product.images && product.images.length > 0 ? product.images[0] : null,
                                category: 'Waste',
                                type: product.type,
                                quantity: 1,
                                isWasteProduct: true
                              };

                              if (!isAuthenticated) {
                                // Add to local storage cart
                                const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
                                const existingItem = existingCart.find(item => item._id === product._id);

                                if (existingItem) {
                                  existingItem.quantity += 1;
                                } else {
                                  existingCart.push(cartItem);
                                }

                                localStorage.setItem('cart', JSON.stringify(existingCart));
                                updateCartBadge();
                                alert('Waste product added to cart!');
                              } else {
                                // Add to server cart
                                api.post('/cart', {
                                  productId: product._id,
                                  quantity: 1,
                                  isWasteProduct: true
                                })
                                .then(() => {
                                  updateCartBadge();
                                  alert('Waste product added to cart!');
                                })
                                .catch(err => {
                                  console.error('Error adding to cart:', err);
                                  alert('Failed to add waste product to cart. Please try again.');
                                });
                              }
                            }}
                          >
                            <i className="bi bi-cart-plus"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="mt-4">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      >
                        Previous
                      </button>
                    </li>
                    
                    {[...Array(totalPages).keys()].map(page => (
                      <li 
                        key={page + 1} 
                        className={`page-item ${currentPage === page + 1 ? 'active' : ''}`}
                      >
                        <button 
                          className="page-link" 
                          onClick={() => setCurrentPage(page + 1)}
                        >
                          {page + 1}
                        </button>
                      </li>
                    ))}
                    
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Waste;