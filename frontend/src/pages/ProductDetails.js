import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import FeedbackForm from "../components/FeedbackForm";
import ReviewForm from "../components/ReviewForm";
import { updateCartBadge } from "../utils/cartUtils";
import ImageWithFallback from "../components/ImageWithFallback";
// Use alert instead of toast for simplicity
// We'll use browser alerts instead of toast notifications

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  // These functions are now defined using useCallback above

  // Define fetchProduct and fetchFeedback using useCallback to avoid infinite loops
  const fetchProduct = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products/${id}`);
      setProduct(res.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching product:", err);
      setError("Failed to load product details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchFeedback = React.useCallback(async () => {
    try {
      const res = await api.get(`/feedback/product/${id}`);
      setFeedbacks(res.data);
    } catch (err) {
      console.error("Error fetching feedback:", err);
    }
  }, [id]);

  const fetchReviews = React.useCallback(async () => {
    try {
      const res = await api.get(`/reviews/product/${id}`);
      setReviews(res.data);

      // Also fetch review statistics
      const statsRes = await api.get(`/reviews/product/${id}/stats`);
      setReviewStats(statsRes.data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchFeedback();
      fetchReviews();
    } else {
      navigate("/products");
    }
  }, [id, navigate, fetchProduct, fetchFeedback, fetchReviews]);

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);

      // Check if user is logged in
      const token = localStorage.getItem('token');

      if (token) {
        // Add to cart in the backend
        await api.post('/cart', {
          productId: id,
          quantity: quantity
        });

        // toast.success('Product added to cart!');
        alert('Product added to cart!');
      } else {
        // Add to cart in localStorage
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');

        // Check if product already exists in cart
        const existingItemIndex = cart.findIndex(item => item._id === product._id);

        if (existingItemIndex !== -1) {
          // Update quantity if product exists
          cart[existingItemIndex].quantity += quantity;
        } else {
          // Add new product to cart
          cart.push({
            _id: product._id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            stock: product.stock,
            quantity: quantity
          });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        // toast.success('Product added to cart!');
        alert('Product added to cart!');
      }

      // Update cart badge count
      updateCartBadge();
    } catch (err) {
      console.error('Error adding to cart:', err);
      // toast.error(err.response?.data?.message || 'Failed to add product to cart');
      alert(err.response?.data?.message || 'Failed to add product to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  // Using the imported updateCartBadge function from utils/cartUtils.js

  // Update cart badge on component mount
  useEffect(() => {
    updateCartBadge();
  }, []);

  return (
    <div className="container mt-5">
      {/* Toast notifications replaced with browser alerts */}
      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="text-center">
          <p>Loading product details...</p>
        </div>
      ) : product ? (
        <>
          <div className="row mb-5">
            <div className="col-md-6">
              {product.image && (
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  className="img-fluid rounded"
                  fallbackSrc="https://via.placeholder.com/400x400?text=No+Image"
                />
               )}
            </div>
            <div className="col-md-6">
              <h2>{product.name}</h2>
              <p className="text-muted">{product.category}</p>

              {/* Product Rating */}
              <div className="mb-3">
                <div className="d-flex align-items-center">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`bi ${i < (product.rating || 0) ? 'bi-star-fill' : 'bi-star'} text-warning`}
                    ></i>
                  ))}
                  <span className="ms-2">
                    {product.rating ? product.rating.toFixed(1) : '0'} ({product.numReviews || 0} {product.numReviews === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              </div>

              {/* Add edit and delete buttons for product owner */}
              {localStorage.getItem('userId') === product.seller?._id && (
                <div className="d-flex gap-2 mb-4">
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

              <p>{product.description}</p>
              <p className="text-success fs-4">₹{product.price}/{product.unit}</p>
              <p>In Stock: {product.stock} {product.unit}</p>

              {product.stock > 0 ? (
                <div className="d-flex align-items-center mb-3">
                  <div className="input-group me-3" style={{ width: '120px' }}>
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    >
                      -
                    </button>
                    <input
                      type="text"
                      className="form-control text-center"
                      value={quantity}
                      readOnly
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                    >
                      +
                    </button>
                  </div>
                </div>
              ) : (
                <div className="alert alert-warning">Out of stock</div>
              )}

              <div>
                <button
                  className="btn btn-primary me-2"
                  onClick={() => navigate("/checkout", { state: { product, quantity } })}
                  disabled={product.stock <= 0 || addingToCart}
                >
                  <i className="bi bi-lightning-fill"></i> Buy Now
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0 || addingToCart}
                >
                  {addingToCart ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      Adding...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-cart-plus"></i> Add to Cart
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-5">
            <h3>Product Reviews</h3>

            {reviewStats && (
              <div className="card mb-4">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-4 text-center border-end">
                      <h2 className="display-4 text-primary">{reviewStats.avgRating.toFixed(1)}</h2>
                      <div className="mb-2">
                        {[...Array(5)].map((_, i) => (
                          <i
                            key={i}
                            className={`bi ${i < Math.round(reviewStats.avgRating) ? 'bi-star-fill' : 'bi-star'} text-warning`}
                          ></i>
                        ))}
                      </div>
                      <p className="text-muted">{reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? 'review' : 'reviews'}</p>
                    </div>

                    <div className="col-md-8">
                      <div className="px-4">
                        {[5, 4, 3, 2, 1].map(rating => (
                          <div key={rating} className="d-flex align-items-center mb-2">
                            <div className="text-muted" style={{width: '60px'}}>{rating} stars</div>
                            <div className="progress flex-grow-1 mx-2" style={{height: '8px'}}>
                              <div
                                className="progress-bar bg-warning"
                                role="progressbar"
                                style={{
                                  width: `${reviewStats.totalReviews > 0
                                    ? (reviewStats.ratingCounts[rating] / reviewStats.totalReviews) * 100
                                    : 0}%`
                                }}
                                aria-valuenow={reviewStats.ratingCounts[rating]}
                                aria-valuemin="0"
                                aria-valuemax={reviewStats.totalReviews}
                              ></div>
                            </div>
                            <div className="text-muted" style={{width: '30px'}}>{reviewStats.ratingCounts[rating] || 0}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <ReviewForm productId={id} onReviewSubmitted={fetchReviews} />

            {reviews.length > 0 ? (
              <div className="list-group mt-4">
                {reviews.map((review) => (
                  <div key={review._id} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="mb-0">{review.user?.name || "Anonymous User"}</h5>
                        {review.isVerifiedPurchase && (
                          <span className="badge bg-success me-2">Verified Purchase</span>
                        )}
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
                    <p className="mt-2 mb-1">{review.comment}</p>

                    {/* Additional ratings */}
                    {(review.qualityRating || review.deliveryRating || review.serviceRating) && (
                      <div className="d-flex flex-wrap mt-2 text-muted small">
                        {review.qualityRating && (
                          <div className="me-3">
                            <span>Quality: {review.qualityRating}/5</span>
                          </div>
                        )}
                        {review.deliveryRating && (
                          <div className="me-3">
                            <span>Delivery: {review.deliveryRating}/5</span>
                          </div>
                        )}
                        {review.serviceRating && (
                          <div>
                            <span>Service: {review.serviceRating}/5</span>
                          </div>
                        )}
                      </div>
                    )}

                    <small className="text-muted d-block mt-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </small>

                    {/* Review replies */}
                    {review.replies && review.replies.length > 0 && (
                      <div className="mt-3 ps-3 border-start border-primary">
                        {review.replies.map((reply, index) => (
                          <div key={index} className="mb-2">
                            <div className="fw-bold">Seller Response:</div>
                            <p className="mb-1">{reply.comment}</p>
                            <small className="text-muted">
                              {new Date(reply.createdAt).toLocaleDateString()}
                            </small>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3">No reviews yet. Be the first to review this product!</p>
            )}
          </div>

          {/* Feedback Section */}
          <div className="mt-5">
            <h3>Product Feedback</h3>
            <FeedbackForm productId={id} />

            {feedbacks.length > 0 ? (
              <div className="list-group mt-4">
                {feedbacks.map((feedback) => (
                  <div key={feedback._id} className="list-group-item">
                    <div className="d-flex justify-content-between">
                      <h5>{feedback.user?.name || "Anonymous User"}</h5>
                      <span>{feedback.rating} <span role="img" aria-label="star rating">⭐</span></span>
                    </div>
                    <p className="mb-1">{feedback.message}</p>
                    <small className="text-muted">
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3">No feedback yet. Be the first to leave feedback!</p>
            )}
          </div>
        </>
      ) : (
        <div className="alert alert-warning">
          Product not found. <a href="/products">View all products</a>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
