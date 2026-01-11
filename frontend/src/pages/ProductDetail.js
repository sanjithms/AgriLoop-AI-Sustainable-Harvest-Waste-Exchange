// THIS FILE IS DEPRECATED - Using ProductDetails.js instead
// This file can be safely deleted

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Meta from '../components/Meta';
import ReviewForm from '../components/ReviewForm';
import FeedbackForm from '../components/FeedbackForm';
import { updateCartBadge } from '../utils/cartUtils';
import ImageWithFallback from '../components/ImageWithFallback';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [sellerContact, setSellerContact] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  // eslint-disable-next-line no-unused-vars
  const [contactSuccess, setContactSuccess] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchReviews();
    }
  }, [id]); // fetchProduct and fetchReviews are defined inside the component

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${id}`);
      setProduct(response.data);
      
      // Check if current user is the owner
      const userId = localStorage.getItem('userId');
      if (userId && response.data.seller && response.data.seller._id === userId) {
        setIsOwner(true);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/reviews/product/${id}`);
      setReviews(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setSellerContact(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // eslint-disable-next-line no-unused-vars
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/products/${id}/contact`, sellerContact);
      setContactSuccess(true);
      setSellerContact({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
      setTimeout(() => setContactSuccess(false), 5000);
    } catch (err) {
      console.error('Error sending contact message:', err);
      alert('Failed to send message. Please try again.');
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // eslint-disable-next-line no-unused-vars
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/products/${id}/reviews`, reviewForm);
      alert('Review submitted successfully!');
      setReviewForm({
        rating: 5,
        comment: ''
      });
      fetchReviews(); // Refresh reviews
    } catch (err) {
      console.error('Error submitting review:', err);
      alert('Failed to submit review. Please try again.');
    }
  };

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        // If not logged in, store in local storage
        const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingProduct = existingCart.find(item => item._id === product._id);

        if (existingProduct) {
          existingProduct.quantity += quantity;
        } else {
          existingCart.push({
            _id: product._id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            stock: product.stock,
            quantity: quantity
          });
        }

        localStorage.setItem('cart', JSON.stringify(existingCart));
        // Update cart badge count
        updateCartBadge();
        alert('Product added to cart!');
      } else {
        // If logged in, use API
        await api.post('/cart', {
          productId: product._id,
          quantity: quantity
        });

        // Update cart badge count
        updateCartBadge();
        alert('Product added to cart!');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add product to cart. Please try again.');
    }
  };

  const handleBuyNow = () => {
    // Store product in state and navigate to checkout
    navigate('/checkout', {
      state: {
        product: product,
        quantity: quantity
      }
    });
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
        <Link to="/products" className="btn btn-primary">
          Back to Products
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">Product not found</div>
        <Link to="/products" className="btn btn-primary">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      <Meta title={`${product.name} | Smart Agri System`} />
      
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/products">Products</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{product.name}</li>
        </ol>
      </nav>
      
      <div className="row">
        {/* Product Images and Details */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <div className="row">
                {/* Product Image */}
                <div className="col-md-6 mb-4 mb-md-0">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="img-fluid rounded"
                    style={{ width: '100%', height: 'auto', maxHeight: '400px', objectFit: 'cover' }}
                    fallbackSrc="https://via.placeholder.com/400x400?text=No+Image"
                  />
                </div>
                
                {/* Product Details */}
                <div className="col-md-6">
                  <h2 className="mb-2">{product.name}</h2>
                  <div className="mb-3">
                    <span className="badge bg-primary me-2">{product.category}</span>
                    {product.organic && <span className="badge bg-success">Organic</span>}
                  </div>
                  
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <i 
                          key={i} 
                          className={`bi ${i < (product.rating || 0) ? 'bi-star-fill' : 'bi-star'} text-warning`}
                        ></i>
                      ))}
                      <span className="ms-2 text-muted">
                        {product.numReviews || 0} {product.numReviews === 1 ? 'review' : 'reviews'}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-primary mb-3">₹{product.price}</h3>
                  
                  <p className="mb-3">
                    <span className={`badge ${product.stock > 0 ? 'bg-success' : 'bg-danger'}`}>
                      {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                    {product.stock > 0 && (
                      <span className="ms-2 text-muted">
                        {product.stock} units available
                      </span>
                    )}
                  </p>
                  
                  {product.stock > 0 && (
                    <div className="mb-4">
                      <div className="d-flex align-items-center mb-3">
                        <label htmlFor="quantity" className="me-3">Quantity:</label>
                        <div className="input-group" style={{ width: '120px' }}>
                          <button 
                            className="btn btn-outline-secondary" 
                            type="button"
                            onClick={() => setQuantity(prev => Math.max(prev - 1, 1))}
                            disabled={quantity <= 1}
                          >
                            -
                          </button>
                          <input 
                            type="number" 
                            id="quantity"
                            className="form-control text-center" 
                            value={quantity} 
                            onChange={(e) => setQuantity(Math.min(Math.max(1, parseInt(e.target.value) || 1), product.stock))}
                            min="1"
                            max={product.stock}
                          />
                          <button 
                            className="btn btn-outline-secondary" 
                            type="button"
                            onClick={() => setQuantity(prev => Math.min(prev + 1, product.stock))}
                            disabled={quantity >= product.stock}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      <div className="d-grid gap-2">
                        <button 
                          className="btn btn-primary"
                          onClick={handleAddToCart}
                        >
                          <i className="bi bi-cart-plus me-2"></i>
                          Add to Cart
                        </button>
                        <button 
                          className="btn btn-success"
                          onClick={handleBuyNow}
                        >
                          <i className="bi bi-lightning-fill me-2"></i>
                          Buy Now
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {isOwner && (
                    <div className="d-flex gap-2 mt-3">
                      <Link to={`/edit-product/${product._id}`} className="btn btn-primary flex-grow-1">
                        <i className="bi bi-pencil me-2"></i>
                        Edit Product
                      </Link>
                      <button 
                        className="btn btn-danger"
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to delete this product?')) {
                            try {
                              await api.delete(`/products/${product._id}`);
                              navigate('/products');
                              alert('Product deleted successfully');
                            } catch (err) {
                              console.error('Error deleting product:', err);
                              alert('Failed to delete product. Please try again.');
                            }
                          }
                        }}
                      >
                        <i className="bi bi-trash me-2"></i>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Product Description */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white">
              <h4 className="mb-0">Product Description</h4>
            </div>
            <div className="card-body">
              <p>{product.description}</p>
              
              {/* Farmer-specific information */}
              {(product.harvestDate || product.expiryDate || product.farmLocation || product.cultivationMethod) && (
                <div className="mt-4">
                  <h5>Product Information</h5>
                  <div className="row">
                    {product.harvestDate && (
                      <div className="col-md-6 mb-3">
                        <div className="card h-100">
                          <div className="card-body">
                            <h6 className="card-subtitle mb-2 text-muted">Harvest Date</h6>
                            <p className="card-text">{new Date(product.harvestDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {product.expiryDate && (
                      <div className="col-md-6 mb-3">
                        <div className="card h-100">
                          <div className="card-body">
                            <h6 className="card-subtitle mb-2 text-muted">Best Before</h6>
                            <p className="card-text">{new Date(product.expiryDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {product.farmLocation && (
                      <div className="col-md-6 mb-3">
                        <div className="card h-100">
                          <div className="card-body">
                            <h6 className="card-subtitle mb-2 text-muted">Farm Location</h6>
                            <p className="card-text">{product.farmLocation}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {product.cultivationMethod && (
                      <div className="col-md-6 mb-3">
                        <div className="card h-100">
                          <div className="card-body">
                            <h6 className="card-subtitle mb-2 text-muted">Cultivation Method</h6>
                            <p className="card-text">{product.cultivationMethod}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {product.features && product.features.length > 0 && (
                <div className="mt-3">
                  <h5>Key Features</h5>
                  <ul>
                    {product.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}

              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="mt-3">
                  <h5>Specifications</h5>
                  <table className="table table-bordered">
                    <tbody>
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <tr key={key}>
                          <th style={{ width: '30%' }}>{key}</th>
                          <td>{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          
          {/* Reviews Section */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Customer Reviews</h4>
              <span className="badge bg-primary">{reviews.length} Reviews</span>
            </div>
            <div className="card-body">
              {reviews.length === 0 ? (
                <p className="text-muted">No reviews yet. Be the first to review this product!</p>
              ) : (
                <div className="mb-4">
                  {reviews.map((review, index) => (
                    <div key={index} className="border-bottom pb-3 mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                          <h5 className="mb-0">{review.name || 'Anonymous'}</h5>
                          <div className="text-muted small">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          {[...Array(5)].map((_, i) => (
                            <i
                              key={i}
                              className={`bi ${i < review.rating ? 'bi-star-fill' : 'bi-star'} text-warning`}
                            ></i>
                          ))}
                        </div>
                      </div>
                      <p className="mb-0">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Review and Feedback Forms */}
              {product && localStorage.getItem('token') && (
                <div className="mt-4">
                  <ReviewForm productId={product._id} onReviewSubmitted={() => fetchProduct()} />
                  <FeedbackForm productId={product._id} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          {/* Seller Information */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white">
              <h4 className="mb-0">
                {product.seller?.role === 'farmer' ? 'Farmer Information' : 'Seller Information'}
              </h4>
            </div>
            <div className="card-body">
              <h5>{product.seller?.name || 'Unknown Seller'}</h5>

              {product.seller?.role === 'farmer' && product.farmLocation && (
                <p className="text-muted mb-2">
                  <i className="bi bi-geo-alt me-2"></i>
                  {product.farmLocation}
                </p>
              )}

              <p className="text-muted mb-3">
                <i className="bi bi-geo-alt me-2"></i>
                {product.seller?.location || 'Location not specified'}
              </p>

              {product.seller?.role === 'farmer' && (
                <div className="alert alert-success mb-3">
                  <i className="bi bi-info-circle me-2"></i>
                  By buying directly from this farmer, you're supporting local agriculture and reducing the carbon footprint of your food.
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white">
              <h4 className="mb-0">Related Products</h4>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {[1, 2, 3].map((_, index) => (
                  <Link 
                    key={index} 
                    to={`/product/${index + 1}`} 
                    className="list-group-item list-group-item-action"
                  >
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <div className="bg-light rounded" style={{ width: '60px', height: '60px' }}></div>
                      </div>
                      <div className="ms-3">
                        <h6 className="mb-0">Related Product {index + 1}</h6>
                        <p className="text-muted mb-0 small">₹XXX.XX</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
          {/* Delivery Information */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h4 className="mb-0">Delivery Information</h4>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <i className="bi bi-truck text-primary me-2"></i>
                <span>Free delivery on orders above ₹500</span>
              </div>
              <div className="mb-3">
                <i className="bi bi-arrow-return-left text-primary me-2"></i>
                <span>7-day return policy</span>
              </div>
              <div>
                <i className="bi bi-shield-check text-primary me-2"></i>
                <span>Quality guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;