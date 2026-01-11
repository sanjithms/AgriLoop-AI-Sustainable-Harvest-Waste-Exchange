import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Meta from '../components/Meta';
import { getImageUrl } from '../utils/imageUtils';

const WasteManagement = () => {
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
  }, [filters, sort, currentPage]);

  const fetchWasteProducts = async () => {
    try {
      setLoading(true);
      
      // Build query string
      let queryString = `?page=${currentPage}&sort=${sort}`;
      if (filters.type) queryString += `&type=${filters.type}`;
      if (filters.minPrice) queryString += `&minPrice=${filters.minPrice}`;
      if (filters.maxPrice) queryString += `&maxPrice=${filters.maxPrice}`;
      if (filters.location) queryString += `&location=${filters.location}`;
      if (filters.search) queryString += `&search=${filters.search}`;
      
      const response = await api.get(`/waste-products${queryString}`);
      
      setWasteProducts(response.data.wasteProducts);
      setTotalPages(response.data.totalPages);
      setError(null);
    } catch (err) {
      console.error('Error fetching waste products:', err);
      setError('Failed to load waste products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
    setCurrentPage(1); // Reset to first page when sort changes
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchWasteProducts();
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      minPrice: '',
      maxPrice: '',
      location: '',
      search: ''
    });
    setCurrentPage(1);
  };

  return (
    <div className="container mt-4 mb-5">
      <Meta title="Waste Management | Smart Agri System" />
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Agricultural Waste Management</h2>
        <Link to="/waste-products/add" className="btn btn-success">
          <i className="bi bi-plus-circle me-2"></i> List Waste Product
        </Link>
      </div>
      
      <div className="row mb-4">
        <div className="col-lg-3">
          {/* Filters */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">Filters</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSearch}>
                <div className="mb-3">
                  <label htmlFor="search" className="form-label">Search</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      id="search"
                      name="search"
                      value={filters.search}
                      onChange={handleFilterChange}
                      placeholder="Search waste products..."
                    />
                    <button type="submit" className="btn btn-primary">
                      <i className="bi bi-search"></i>
                    </button>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="type" className="form-label">Waste Type</label>
                  <select
                    className="form-select"
                    id="type"
                    name="type"
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
                  <label htmlFor="location" className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-control"
                    id="location"
                    name="location"
                    value={filters.location}
                    onChange={handleFilterChange}
                    placeholder="Enter location..."
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Price Range</label>
                  <div className="row g-2">
                    <div className="col-6">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Min"
                        name="minPrice"
                        value={filters.minPrice}
                        onChange={handleFilterChange}
                        min="0"
                      />
                    </div>
                    <div className="col-6">
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
                </div>
                
                <div className="d-grid">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Information Card */}
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Why Waste Management?</h5>
              <p className="card-text">
                Agricultural waste management helps reduce environmental impact, creates additional revenue streams, and promotes sustainable farming practices.
              </p>
              <Link to="/awareness-page" className="btn btn-outline-success w-100">
                Learn More
              </Link>
            </div>
          </div>
        </div>
        
        <div className="col-lg-9">
          {/* Sort and Results Count */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              {!loading && (
                <p className="mb-0">
                  Showing {wasteProducts.length} results
                </p>
              )}
            </div>
            <div className="d-flex align-items-center">
              <label htmlFor="sort" className="me-2">Sort by:</label>
              <select
                className="form-select form-select-sm"
                id="sort"
                value={sort}
                onChange={handleSortChange}
                style={{ width: 'auto' }}
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
          
          {/* Error Message */}
          {error && (
            <div className="alert alert-danger">{error}</div>
          )}
          
          {/* Loading Indicator */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading waste products...</p>
            </div>
          ) : wasteProducts.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-4">
                <i className="bi bi-recycle" style={{ fontSize: '3rem' }}></i>
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
                        <img
                          src={getImageUrl(product.images[0])}
                          className="card-img-top"
                          alt={product.name}
                          style={{ height: '200px', objectFit: 'cover' }}
                          onError={(e) => {
                            console.error('Image failed to load:', product.images[0]);
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
                        <div className="d-grid">
                          <Link to={`/waste-products/${product._id}`} className="btn btn-outline-primary">
                            View Details
                          </Link>
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

export default WasteManagement;