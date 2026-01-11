import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import api from "../api/axios";
import { useLocation, useNavigate } from "react-router-dom";
import { updateCartBadge } from "../utils/cartUtils";
import "../styles/Checkout.css"; // Import new CSS file

// We'll load this from environment variable in production
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

const CheckoutForm = ({ products, totalAmount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [upiId, setUpiId] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [selectedUPIApp, setSelectedUPIApp] = useState('');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    postalCode: ''
  });

  const upiApps = [
    { id: 'gpay', name: 'Google Pay', icon: 'google' },
    { id: 'phonepe', name: 'PhonePe', icon: 'phone' },
    { id: 'paytm', name: 'Paytm', icon: 'wallet' },
    { id: 'bhim', name: 'BHIM UPI', icon: 'currency-rupee' }
  ];

  const handleChange = (e) => {
    setCustomerInfo({
      ...customerInfo,
      [e.target.name]: e.target.value
    });
  };

  const verifyUPIPayment = async (upiTransactionId) => {
    try {
      const response = await api.post("/payments/verify-upi", {
        upiId,
        upiTransactionId,
        amount: totalAmount
      });

      if (response.data.success) {
        // Create order after successful UPI verification
        await api.post("/payments/create-order", {
          products,
          customerInfo,
          totalAmount,
          paymentMethod: 'upi',
          upiId,
          upiTransactionId: response.data.transactionId
        });

        // Clear cart and redirect
        if (products.length > 1) {
          await api.delete('/cart');
        }
        alert("Payment Successful! Your order has been placed.");
        navigate("/dashboard");
      }
    } catch (error) {
      setError("UPI payment verification failed. Please try again.");
      console.error("UPI verification error:", error);
    }
  };

  const handleUPIVerification = async () => {
    setLoading(true);
    setError(null);
    
    // Simulate UPI payment verification
    // In a real implementation, this would integrate with a UPI payment gateway
    await verifyUPIPayment('SIMULATED_UPI_TXN_' + Date.now());
    
    setLoading(false);
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    // Validate form
    for (const field in customerInfo) {
      if (!customerInfo[field]) {
        setError(`Please fill in your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return;
      }
    }

    // Validate payment method specific fields
    if (paymentMethod === 'card' && (!stripe || !elements)) {
      setError('Card payment is not available at the moment. Please try another payment method.');
      return;
    }

    if (paymentMethod === 'upi' && !upiId) {
      setError('Please enter your UPI ID');
      return;
    }

    if (paymentMethod === 'upi' && !upiId.includes('@')) {
      setError('Please enter a valid UPI ID (e.g., username@upi)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (paymentMethod === 'upi') {
        await handleUPIVerification();
      } else if (paymentMethod === 'cod') {
        await api.post("/payments/create-order", {
          products,
          customerInfo,
          totalAmount: totalAmount + 50,
          paymentMethod: 'cod'
        });
      } else {
        // Card payment flow
        const response = await api.post(
          "/payments/create-payment-intent",
          {
            products,
            customerInfo,
            paymentMethod
          }
        );

        const clientSecret = response.data.clientSecret;
        const paymentResult = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: customerInfo.name,
              email: customerInfo.email,
              address: {
                line1: customerInfo.address,
                city: customerInfo.city,
                state: customerInfo.state,
                postal_code: customerInfo.postalCode
              }
            },
          },
        });

        if (paymentResult.error) {
          setError(`Payment Failed: ${paymentResult.error.message}`);
          return;
        }
        
        if (paymentResult.paymentIntent.status === 'succeeded') {
          await api.post("/payments/create-order", {
            products,
            paymentIntentId: paymentResult.paymentIntent.id,
            customerInfo,
            totalAmount,
            paymentMethod
          });
        }
      }

      // Clear cart and update UI regardless of payment method
      await api.delete('/cart');
      localStorage.removeItem('cart'); // Clear local cart as well
      updateCartBadge();

      // Show appropriate success message
      if (paymentMethod === 'cod') {
        alert(`Order placed successfully! You will pay ₹${(totalAmount + 50)} at delivery.`);
      } else {
        alert("Payment Successful! Your order has been placed.");
      }

      // Redirect to orders page
      navigate("/orders");
      
    } catch (error) {
      console.error("Error in payment:", error);
      setError(error.response?.data?.message || "Payment processing failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handlePayment}>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row mb-3">
        <div className="col-md-6 mb-3">
          <label htmlFor="name" className="form-label">Full Name</label>
          <input
            type="text"
            className="form-control"
            id="name"
            name="name"
            value={customerInfo.name}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div className="col-md-6 mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={customerInfo.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="address" className="form-label">Address</label>
        <input
          type="text"
          className="form-control"
          id="address"
          name="address"
          value={customerInfo.address}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>

      <div className="row mb-3">
        <div className="col-md-4 mb-3">
          <label htmlFor="city" className="form-label">City</label>
          <input
            type="text"
            className="form-control"
            id="city"
            name="city"
            value={customerInfo.city}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div className="col-md-4 mb-3">
          <label htmlFor="state" className="form-label">State</label>
          <input
            type="text"
            className="form-control"
            id="state"
            name="state"
            value={customerInfo.state}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div className="col-md-4 mb-3">
          <label htmlFor="postalCode" className="form-label">Postal Code</label>
          <input
            type="text"
            className="form-control"
            id="postalCode"
            name="postalCode"
            value={customerInfo.postalCode}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="form-label fw-bold">Payment Method</label>
        <div className="payment-methods">
          {/* Card Payment Option */}
          <div className="payment-option" onClick={() => setPaymentMethod('card')}>
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={() => setPaymentMethod('card')}
              className="form-check-input"
            />
            <div className="ms-2">
              <div className="d-flex align-items-center">
                <i className="bi bi-credit-card me-2 text-primary"></i>
                <span className="fw-bold">Credit/Debit Card</span>
              </div>
              <small className="text-muted">Secure payment via Stripe</small>
            </div>
          </div>

          {/* UPI Payment Option */}
          <div className="payment-option" onClick={() => setPaymentMethod('upi')}>
            <input
              type="radio"
              name="paymentMethod"
              value="upi"
              checked={paymentMethod === 'upi'}
              onChange={() => setPaymentMethod('upi')}
              className="form-check-input"
            />
            <div className="ms-2">
              <div className="d-flex align-items-center">
                <i className="bi bi-phone me-2 text-success"></i>
                <span className="fw-bold">UPI Payment</span>
              </div>
              <small className="text-muted">Pay using any UPI app</small>
            </div>
          </div>

          {/* Cash on Delivery Option */}
          <div className="payment-option" onClick={() => setPaymentMethod('cod')}>
            <input
              type="radio"
              name="paymentMethod"
              value="cod"
              checked={paymentMethod === 'cod'}
              onChange={() => setPaymentMethod('cod')}
              className="form-check-input"
            />
            <div className="ms-2">
              <div className="d-flex align-items-center">
                <i className="bi bi-cash-coin me-2 text-warning"></i>
                <span className="fw-bold">Cash on Delivery</span>
              </div>
              <small className="text-muted">Pay when you receive the order</small>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Specific Fields */}
      {paymentMethod === 'card' && (
        <div className="card-element-container p-3 border rounded mb-4">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      )}

      {paymentMethod === 'upi' && (
        <div className="upi-payment-section mb-4">
          <div className="upi-apps mb-3">
            {upiApps.map(app => (
              <button
                key={app.id}
                type="button"
                className={`btn ${selectedUPIApp === app.id ? 'btn-primary' : 'btn-outline-primary'} me-2 mb-2`}
                onClick={() => setSelectedUPIApp(app.id)}
              >
                <i className={`bi bi-${app.icon} me-2`}></i>
                {app.name}
              </button>
            ))}
          </div>

          <div className="mb-3">
            <label className="form-label">UPI Payment Options</label>
            <div className="d-flex gap-3">
              <button
                type="button"
                className={`btn ${!showQR ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setShowQR(false)}
              >
                <i className="bi bi-keyboard me-2"></i>
                Enter UPI ID
              </button>
              <button
                type="button"
                className={`btn ${showQR ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setShowQR(true)}
              >
                <i className="bi bi-qr-code me-2"></i>
                Scan QR Code
              </button>
            </div>
          </div>

          {!showQR ? (
            <div className="mb-3">
              <label htmlFor="upiId" className="form-label">UPI ID</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  id="upiId"
                  placeholder="username@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  required={paymentMethod === 'upi' && !showQR}
                />
                <span className="input-group-text">
                  <i className="bi bi-patch-check text-success"></i>
                </span>
              </div>
              <small className="text-muted">Enter your UPI ID (e.g., username@okicici, username@ybl)</small>
            </div>
          ) : (
            <div className="qr-code-container text-center p-4 border rounded">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=merchant-upi-id@ybl&pn=Smart%20Agri%20System&am=${totalAmount}&cu=INR`}
                alt="Payment QR Code"
                className="mb-3"
              />
              <p className="mb-0 text-muted">Scan this QR code using any UPI app to pay</p>
            </div>
          )}
        </div>
      )}

      {paymentMethod === 'cod' && (
        <div className="alert alert-warning mb-4">
          <i className="bi bi-info-circle me-2"></i>
          Cash on Delivery charges of ₹50 will be added to your order amount.
        </div>
      )}

      <button
        className="btn btn-success btn-lg w-100"
        disabled={loading || (paymentMethod === 'card' && !stripe)}
        type="submit"
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
            Processing...
          </>
        ) : (
          <>
            <i className={`bi bi-${paymentMethod === 'card' ? 'credit-card' : paymentMethod === 'upi' ? 'phone' : 'cash-coin'} me-2`}></i>
            Pay ₹{totalAmount.toFixed(2)} {paymentMethod === 'cod' ? '+ ₹50 (COD charges)' : ''}
          </>
        )}
      </button>
    </form>
  );
};

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setLoading(true);

        // Check if coming from product details (Buy Now)
        if (location.state?.product) {
          const product = location.state.product;
          const quantity = location.state.quantity || 1;

          setProducts([{
            ...product,
            quantity
          }]);

          setTotalAmount(product.price * quantity);
        }
        // Check if coming from cart
        else if (location.state?.fromCart) {
          // Fetch cart items from API
          const response = await api.get('/cart');
          setProducts(response.data);

          // Calculate total
          const total = response.data.reduce(
            (sum, item) => sum + (item.price * item.quantity),
            0
          );
          setTotalAmount(total);
        }
        // Redirect if no products
        else {
          navigate("/cart");
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching checkout data:', err);
        setError('Failed to load checkout data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [location, navigate]);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading checkout...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/cart')}
        >
          Return to Cart
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">No products in checkout</div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/products')}
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <div className="container mt-5">
        <h2>Checkout</h2>

        <div className="row mb-4">
          <div className="col-md-8">
            <div className="card mb-4">
              <div className="card-header">
                <h3 className="mb-0">Payment Details</h3>
              </div>
              <div className="card-body">
                <CheckoutForm products={products} totalAmount={totalAmount} />
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card mb-4">
              <div className="card-header">
                <h3 className="mb-0">Order Summary</h3>
              </div>
              <div className="card-body">
                {products.map(product => (
                  <div key={product._id} className="d-flex justify-content-between mb-2">
                    <span>
                      {product.name}
                      {product.quantity > 1 && <span className="text-muted"> x{product.quantity}</span>}
                    </span>
                    <span>₹{(product.price * product.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <hr />
                <div className="d-flex justify-content-between fw-bold">
                  <span>Total</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Secure Payment</h5>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-shield-check text-success me-2 fs-4"></i>
                    <span>Encrypted & Secure</span>
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-credit-card text-success me-2 fs-4"></i>
                    <span>Multiple Payment Options</span>
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-lock text-success me-2 fs-4"></i>
                    <span>Privacy Protected</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => navigate('/cart')}
              >
                Return to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
      <style jsx="true">{`
        .form-check {
          padding: 10px 15px;
          border: 1px solid #dee2e6;
          border-radius: 5px;
          min-width: 150px;
        }
        .form-check-input:checked {
          background-color: #198754;
          border-color: #198754;
        }
        .card-element-container {
          min-height: 40px;
          display: flex;
          align-items: center;
        }
        .payment-methods {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .payment-option {
          padding: 1rem;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
        }

        .payment-option:hover {
          border-color: #198754;
          background-color: #f8f9fa;
        }

        .payment-option input[type="radio"]:checked + div {
          color: #198754;
        }

        .upi-apps {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .qr-code-container {
          background: #f8f9fa;
        }

        .qr-code-container img {
          max-width: 200px;
          height: auto;
        }

        .card-element-container {
          min-height: 40px;
          display: flex;
          align-items: center;
          background: #f8f9fa;
        }

        @media (max-width: 768px) {
          .payment-option {
            padding: 0.75rem;
          }
          
          .upi-apps {
            justify-content: center;
          }
        }
      `}</style>
    </Elements>
  );
};

export default Checkout;
