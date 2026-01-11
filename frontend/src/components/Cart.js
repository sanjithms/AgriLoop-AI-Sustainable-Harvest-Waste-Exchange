import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { updateCartBadge } from '../utils/cartUtils';
import ImageWithFallback from './ImageWithFallback';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartItems();
    // Update cart badge when component mounts
    updateCartBadge();
  }, []);

  useEffect(() => {
    // Calculate total price whenever cart items change
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotalPrice(total);
  }, [cartItems]);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      // Get cart from localStorage if not authenticated
      const token = localStorage.getItem('token');
      
      if (!token) {
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(localCart);
        setLoading(false);
        return;
      }
      
      // Get cart from API if authenticated
      const response = await api.get('/cart');
      setCartItems(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Failed to load your cart. Please try again.');
      
      // Fallback to local cart if API fails
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItems(localCart);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity, isWasteProduct = false) => {
    if (newQuantity < 1) return;

    try {
      const token = localStorage.getItem('token');

      // Update local state immediately for better UX
      setCartItems(prevItems =>
        prevItems.map(item =>
          item._id === productId ? { ...item, quantity: newQuantity } : item
        )
      );

      if (!token) {
        // Update localStorage if not authenticated
        const updatedCart = cartItems.map(item =>
          item._id === productId ? { ...item, quantity: newQuantity } : item
        );
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        // Update cart badge
        updateCartBadge();
        return;
      }

      // Update cart in API if authenticated
      await api.put(`/cart/${productId}`, {
        quantity: newQuantity,
        isWasteProduct: isWasteProduct
      });
    } catch (err) {
      console.error('Error updating cart:', err);
      // Revert to previous state if API call fails
      fetchCartItems();
    }
  };

  const removeItem = async (productId, isWasteProduct = false) => {
    try {
      const token = localStorage.getItem('token');

      // Update local state immediately for better UX
      setCartItems(prevItems => prevItems.filter(item => item._id !== productId));

      if (!token) {
        // Update localStorage if not authenticated
        const updatedCart = cartItems.filter(item => item._id !== productId);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        // Update cart badge
        updateCartBadge();
        return;
      }

      // Remove from API if authenticated
      // For DELETE requests with body, we need to use axios directly
      await api.delete(`/cart/${productId}`, {
        data: { isWasteProduct: isWasteProduct }
      });
    } catch (err) {
      console.error('Error removing item from cart:', err);
      // Revert to previous state if API call fails
      fetchCartItems();
    }
  };

  const clearCart = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Clear local state immediately
      setCartItems([]);
      
      if (!token) {
        // Clear localStorage if not authenticated
        localStorage.setItem('cart', JSON.stringify([]));
        // Update cart badge
        updateCartBadge();
        return;
      }
      
      // Clear cart in API if authenticated
      await api.delete('/cart');
    } catch (err) {
      console.error('Error clearing cart:', err);
      // Revert to previous state if API call fails
      fetchCartItems();
    }
  };

  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }
    
    // Proceed directly to checkout without login check
    navigate('/checkout', { 
      state: { 
        fromCart: true,
        products: cartItems // Pass cart items directly for guest checkout
      } 
    });
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading your cart...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2>Your Shopping Cart</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {cartItems.length === 0 ? (
        <div className="text-center my-5">
          <p>Your cart is empty</p>
          <Link to="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map(item => (
                  <tr key={item._id}>
                    <td>
                      <div className="d-flex align-items-center">
                        {item.image && (
                          <ImageWithFallback
                            src={item.image}
                            alt={item.name}
                            style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '10px' }}
                            fallbackSrc="https://via.placeholder.com/50x50?text=No+Image"
                          />
                        )}
                        <div>
                          <h6 className="mb-0">{item.name}</h6>
                          <small className="text-muted">
                            {item.isWasteProduct ? (
                              <span className="badge bg-success me-1">{item.type || 'Waste'}</span>
                            ) : (
                              item.category
                            )}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>₹{item.price}/{item.unit}</td>
                    <td>
                      <div className="input-group" style={{ width: '120px' }}>
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          type="button"
                          onClick={() => updateQuantity(item._id, item.quantity - 1, item.isWasteProduct)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <input
                          type="text"
                          className="form-control text-center"
                          value={`${item.quantity} ${item.unit}`}
                          readOnly
                        />
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          type="button"
                          onClick={() => updateQuantity(item._id, item.quantity + 1, item.isWasteProduct)}
                          disabled={!item.isWasteProduct && item.quantity >= item.stock}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => removeItem(item._id, item.isWasteProduct)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="text-end fw-bold">Total:</td>
                  <td className="fw-bold">₹{totalPrice.toFixed(2)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div className="d-flex justify-content-between mt-3">
            <button 
              className="btn btn-outline-secondary"
              onClick={clearCart}
            >
              Clear Cart
            </button>
            <div>
              <Link to="/products" className="btn btn-outline-primary me-2">
                Continue Shopping
              </Link>
              <button 
                className="btn btn-success"
                onClick={proceedToCheckout}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;