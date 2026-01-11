import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
// eslint-disable-next-line no-unused-vars
import { addToCart } from '../utils/cartUtils';
import { getImageUrl } from '../utils/imageUtils';
import OptimizedImage from '../components/OptimizedImage';
import Meta from '../components/Meta';

const Product = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    seller: '',
    search: ''
  });
  const [sort, setSort] = useState('createdAt:desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sort, currentPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log("Fetching products...");

      // Build query string
      let queryString = `?page=${currentPage}&sort=${sort}`;
      if (filters.category) queryString += `&category=${filters.category}`;
      if (filters.minPrice) queryString += `&minPrice=${filters.minPrice}`;
      if (filters.maxPrice) queryString += `&maxPrice=${filters.maxPrice}`;
      if (filters.seller) queryString += `&seller=${filters.seller}`;
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
      
      const response = await api.get(`/products${queryString}`);
      console.log("Products response:", response.data);

      if (response.data && response.data.products) {
        setProducts(response.data.products);
        setTotalPages(response.data.totalPages || 1);
      } else if (Array.isArray(response.data)) {
        // Handle case where API returns array directly
        setProducts(response.data);
        setTotalPages(1);
      } else if (response.data && Array.isArray(response.data.data)) {
        // Handle case where API returns { data: [...] }
        setProducts(response.data.data);
        setTotalPages(response.data.totalPages || 1);
      } else {
        console.warn("Unexpected response format:", response.data);
        setProducts([]);
        setTotalPages(1);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
        setError(`Failed to load products: ${err.response.data.message || err.message}`);
      } else if (err.request) {
        console.error('No response received:', err.request);
        setError('Failed to load products: No response from server. Please check your connection.');
      } else {
        console.error('Error message:', err.message);
        setError(`Failed to load products: ${err.message}`);
      }
      setProducts([]);
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
    // No need to call fetchProducts() here as it will be triggered by the useEffect
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      seller: '',
      search: ''
    });
    setSort('createdAt:desc');
    setCurrentPage(1);
  };
  
  const handleAddToCart = async (productId) => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${productId}`);
      const product = response.data;
      
      const success = await addToCart(product, 1, api);
      
      if (success) {
        alert('Product added to cart successfully!');
      } else {
        alert('Failed to add product to cart. Please try again.');
      }
    } catch (err) {
      console.error('Error adding product to cart:', err);
      alert('Failed to add product to cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4 mb-5">
      <Meta title="Agricultural Products | Smart Agri System" />
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Agricultural Products</h2>
        {(localStorage.getItem('role') === 'admin' || localStorage.getItem('role') === 'farmer') && (
          <Link to="/add-product" className="btn btn-success">
            <i className="bi bi-plus-circle me-2"></i>
            Add New Product
          </Link>
        )}
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
                <label htmlFor="category" className="form-label">Category</label>
                <select 
                  id="category" 
                  name="category" 
                  className="form-select"
                  value={filters.category}
                  onChange={handleFilterChange}
                >
                  <option value="">All Categories</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Grains">Grains</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Poultry">Poultry</option>
                  <option value="Seeds">Seeds</option>
                  <option value="Fertilizers">Fertilizers</option>
                  <option value="Equipment">Equipment</option>
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
                <label htmlFor="seller" className="form-label">Seller</label>
                <input 
                  type="text" 
                  id="seller" 
                  name="seller" 
                  className="form-control"
                  placeholder="Enter seller name"
                  value={filters.seller}
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
              <h5 className="card-title">Why Buy Direct?</h5>
              <p className="card-text small">
                Buying directly from farmers ensures fresher products, supports local agriculture, and reduces the carbon footprint of your food.
              </p>
              <Link to="/awareness-page" className="btn btn-sm btn-outline-primary">Learn More</Link>
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
                        placeholder="Search products..."
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
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center my-5">
              <div className="mb-4">
                <i className="bi bi-basket text-muted" style={{ fontSize: '4rem' }}></i>
              </div>
              <h4>No products found</h4>
              <p className="text-muted">Try adjusting your filters or check back later.</p>
            </div>
          ) : (
            <>
              {/* Products Grid */}
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {products.map(product => (
                  <div key={product._id} className="col">
                    <div className="card h-100 border-0 shadow-sm">
                      {product.image ? (
                        <OptimizedImage
                          src={getImageUrl(product.image)}
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
                          <div>
                            <span className="badge bg-primary me-1">{product.category}</span>
                            {product.organic && <span className="badge bg-success">Organic</span>}
                          </div>
                        </div>
                        <p className="card-text text-truncate">{product.description}</p>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-bold text-primary">₹{product.price}/{product.unit}</span>
                          <span className="text-muted small">{product.stock} {product.unit} in stock</span>
                        </div>
                        <p className="card-text small mb-0">
                          <i className="bi bi-person me-1"></i> {product.seller?.name || 'Unknown Seller'}
                        </p>
                      </div>
                      <div className="card-footer bg-white border-top-0">
                        <div className="d-flex gap-2">
                          <Link to={`/product/${product._id}`} className="btn btn-outline-primary flex-grow-1">
                            View Details
                          </Link>
                          <button 
                            className="btn btn-success"
                            onClick={() => handleAddToCart(product._id)}
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

export default Product;