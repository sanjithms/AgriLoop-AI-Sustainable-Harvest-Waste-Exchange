import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Meta from '../components/Meta';

import { updateCartBadge } from '../utils/cartUtils';

// Helper function to get proper image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://via.placeholder.com/400x300?text=No+Image';
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) return imagePath;
  // If it's a local path starting with uploads/, remove the prefix
  const filename = imagePath.replace('uploads/', '').split('/').pop();
  // Construct the full URL using the backend URL
  return `${process.env.REACT_APP_API_URL.replace('/api', '')}/uploads/${filename}`;
};

const WasteProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [sellerContact, setSellerContact] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  // eslint-disable-next-line no-unused-vars
  const [contactSuccess, setContactSuccess] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem('sessionToken');

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
            image: product.images && product.images.length > 0 ? product.images[0] : null,
            category: 'Waste',
            type: product.type,
            quantity: quantity
          });
        }

        localStorage.setItem('cart', JSON.stringify(existingCart));
        // Update cart badge count
        updateCartBadge();
        alert('Waste product added to cart!');
      } else {
        // If logged in, use API
        await api.post('/cart', {
          productId: product._id,
          quantity: quantity,
          isWasteProduct: true
        });

        // Update cart badge count
        updateCartBadge();
        alert('Waste product added to cart!');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add waste product to cart. Please try again.');
    }
  };

  const handleBuyNow = () => {
    // Store product in state and navigate to checkout
    navigate('/checkout', {
      state: {
        product: {
          ...product,
          isWasteProduct: true
        },
        quantity: quantity
      }
    });
  };

  const fetchWasteProduct = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/waste-products/${id}`);
      setProduct(response.data.wasteProduct);

      // Check if current user is the owner
      const userId = localStorage.getItem('userId');
      if (userId && response.data.wasteProduct.seller._id === userId) {
        setIsOwner(true);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching waste product:', err);
      setError('Failed to load waste product details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchWasteProduct();
    }
  }, [id, fetchWasteProduct]);

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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setContactSuccess(true);
      setTimeout(() => setContactSuccess(false), 5000);
      
      setSellerContact(prev => ({
        ...prev,
        message: ''
      }));
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this waste product?')) {
      return;
    }

    try {
      await api.delete(`/waste-products/${id}`);
      alert('Waste product deleted successfully');
      navigate('/waste-management');
    } catch (err) {
      console.error('Error deleting waste product:', err);
      alert('Failed to delete waste product. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading waste product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
        <Link to="/waste-management" className="btn btn-primary">
          Back to Waste Management
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">Waste product not found</div>
        <Link to="/waste-management" className="btn btn-primary">
          Back to Waste Management
        </Link>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      <Meta title={`${product.name} | Waste Management`} />
      
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/waste-management">Waste Management</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{product.name}</li>
        </ol>
      </nav>
      
      <div className="row">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
            </div>
          </div>
        </div>
        
        {/* Product Images */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            {product.images && product.images.length > 0 ? (
              <div>
                <div className="main-image-container mb-3">
                  <img
                    src={getImageUrl(product.images[activeImage])}
                    alt={product.name}
                    className="img-fluid rounded"
                    style={{ width: '100%', height: '400px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                  />
                </div>

                {product.images.length > 1 && (
                  <div className="d-flex overflow-auto">
                    {product.images.map((image, index) => (
                      <div
                        key={index}
                        className={`thumbnail-container me-2 ${index === activeImage ? 'border border-primary' : ''}`}
                        onClick={() => setActiveImage(index)}
                        style={{ cursor: 'pointer' }}
                      >
                        <img
                          src={getImageUrl(image)}
                          alt={`Thumbnail ${index + 1}`}
                          className="img-thumbnail"
                          style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-light text-center py-5 rounded">
                <i className="bi bi-image text-muted" style={{ fontSize: '5rem' }}></i>
                <p className="mt-3">No images available</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Product Details */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Product Details</h4>
            <span className="badge bg-success">{product.type}</span>
          </div>
          <div className="card-body">
            <h2 className="mb-3">{product.name}</h2>
            
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="text-success mb-0">₹{product.price}/{product.unit}</h4>
              <span className="badge bg-info">{product.quantity} {product.unit} available</span>
            </div>
            
            {isOwner && (
              <div className="d-flex gap-2 mb-4">
                <Link to={`/waste-products/edit/${product._id}`} className="btn btn-primary flex-grow-1">
                  <i className="bi bi-pencil me-2"></i>
                  Edit Product
                </Link>
                <button 
                  className="btn btn-danger"
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to delete this waste product?')) {
                      try {
                        await api.delete(`/waste-products/${product._id}`);
                        navigate('/waste');
                        alert('Waste product deleted successfully');
                      } catch (err) {
                        console.error('Error deleting waste product:', err);
                        alert('Failed to delete waste product. Please try again.');
                      }
                    }
                  }}
                >
                  <i className="bi bi-trash me-2"></i>
                  Delete
                </button>
              </div>
            )}

            {!isOwner && (
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
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setQuantity(prev => prev + 1)}
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
            
            <h5>Description</h5>
            <p>{product.description}</p>
            
            <div className="row mt-4">
              <div className="col-md-6">
                <h5>Location</h5>
                <p><i className="bi bi-geo-alt me-2"></i>{product.location}</p>
              </div>
              <div className="col-md-6">
                <h5>Seller</h5>
                <p>
                  {product.seller.businessName || product.seller.name}
                </p>
              </div>
            </div>
            
            {product.possibleUses && product.possibleUses.length > 0 && (
              <div className="mt-4">
                <h5>Possible Uses</h5>
                <ul className="list-group list-group-flush">
                  {product.possibleUses.map((use, index) => (
                    <li key={index} className="list-group-item bg-transparent">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      {use}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {product.nutrientContent && (
              <div className="mt-4">
                <h5>Nutrient Content</h5>
                <div className="row">
                  {product.nutrientContent.nitrogen && (
                    <div className="col-md-3 col-6 mb-3">
                      <div className="card h-100">
                        <div className="card-body text-center">
                          <h6>Nitrogen</h6>
                          <p className="mb-0 fw-bold">{product.nutrientContent.nitrogen}%</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {product.nutrientContent.phosphorus && (
                    <div className="col-md-3 col-6 mb-3">
                      <div className="card h-100">
                        <div className="card-body text-center">
                          <h6>Phosphorus</h6>
                          <p className="mb-0 fw-bold">{product.nutrientContent.phosphorus}%</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {product.nutrientContent.potassium && (
                    <div className="col-md-3 col-6 mb-3">
                      <div className="card h-100">
                        <div className="card-body text-center">
                          <h6>Potassium</h6>
                          <p className="mb-0 fw-bold">{product.nutrientContent.potassium}%</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {product.nutrientContent.organic && (
                    <div className="col-md-3 col-6 mb-3">
                      <div className="card h-100">
                        <div className="card-body text-center">
                          <h6>Organic</h6>
                          <p className="mb-0 fw-bold">{product.nutrientContent.organic}%</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WasteProductDetail;