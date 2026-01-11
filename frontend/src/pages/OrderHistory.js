import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Meta from '../components/Meta';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        console.log("Fetching order history...");

        const token = localStorage.getItem('token');
        if (!token) {
          console.error("No token found when fetching order history");
          setError("Authentication required. Please log in again.");
          setLoading(false);
          return;
        }

        const response = await api.get('/orders/myorders');
        console.log("Order history response:", response.data);

        // Check if the response has the expected format
        if (response.data && response.data.orders) {
          // New API format returns { orders: [...] }
          setOrders(response.data.orders);
        } else if (Array.isArray(response.data)) {
          // Old API format returns the array directly
          setOrders(response.data);
        } else {
          // Fallback to empty array if unexpected format
          console.warn("Unexpected response format:", response.data);
          setOrders([]);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        if (err.response?.status === 401) {
          setError("Your session has expired. Please log in again.");
          // Clear invalid token
          localStorage.removeItem('token');
        } else {
          setError('Failed to load your orders. Please try again.');
        }
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Function to get badge color based on order status
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Processing':
        return 'bg-info';
      case 'Confirmed':
        return 'bg-primary';
      case 'Shipped':
        return 'bg-warning';
      case 'Delivered':
        return 'bg-success';
      case 'Cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get progress percentage for the progress bar
  const getProgressPercentage = (status) => {
    switch (status) {
      case 'Processing':
        return '25%';
      case 'Confirmed':
        return '50%';
      case 'Shipped':
        return '75%';
      case 'Delivered':
        return '100%';
      case 'Cancelled':
        return '25%';
      default:
        return '0%';
    }
  };

  // Check if a step is completed based on current status
  const getStepCompleted = (currentStatus, stepStatus) => {
    const statusOrder = ['Processing', 'Confirmed', 'Shipped', 'Delivered'];

    if (currentStatus === 'Cancelled') {
      return false;
    }

    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepStatus);

    return currentIndex >= stepIndex;
  };

  return (
    <div className="container mt-4 mb-5">
      <Meta title="Order History | Smart Agri System" />
      
      <h2>My Orders</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center my-5">
          <div className="mb-4">
            <i className="bi bi-bag-x" style={{ fontSize: '3rem' }}></i>
          </div>
          <h4>You haven't placed any orders yet</h4>
          <p className="text-muted">Browse our products and place your first order!</p>
          <Link to="/products" className="btn btn-primary mt-3">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="row">
          {orders.map(order => (
            <div key={order._id} className="col-lg-6 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Order #{order.orderNumber}</h5>
                  <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="card-body">
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <p className="text-muted mb-1">Order Date</p>
                      <p className="fw-bold">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="col-md-6">
                      <p className="text-muted mb-1">Total Amount</p>
                      <p className="fw-bold">₹{order.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-muted mb-1">Items</p>
                    <div className="d-flex flex-wrap gap-2">
                      {order.products.map((item, index) => (
                        <div key={index} className="d-flex align-items-center">
                          <span className="badge bg-light text-dark">
                            {item.name} x {item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Timeline */}
                  <div className="mb-3">
                    <p className="text-muted mb-2">Order Progress</p>
                    <div className="d-flex justify-content-between position-relative mb-4">
                      <div className="progress position-absolute" style={{ width: '100%', top: '9px', height: '2px' }}>
                        <div
                          className="progress-bar bg-success"
                          style={{
                            width: getProgressPercentage(order.status)
                          }}
                        ></div>
                      </div>

                      <div className="text-center position-relative">
                        <div className={`rounded-circle ${order.status !== 'Cancelled' ? 'bg-success' : 'bg-secondary'} text-white d-flex align-items-center justify-content-center mb-1`} style={{ width: '20px', height: '20px', fontSize: '12px' }}>
                          <i className="bi bi-check"></i>
                        </div>
                        <small>Ordered</small>
                      </div>

                      <div className="text-center position-relative">
                        <div className={`rounded-circle ${getStepCompleted(order.status, 'Confirmed') ? 'bg-success' : 'bg-secondary'} text-white d-flex align-items-center justify-content-center mb-1`} style={{ width: '20px', height: '20px', fontSize: '12px' }}>
                          {getStepCompleted(order.status, 'Confirmed') ? <i className="bi bi-check"></i> : ''}
                        </div>
                        <small>Confirmed</small>
                      </div>

                      <div className="text-center position-relative">
                        <div className={`rounded-circle ${getStepCompleted(order.status, 'Shipped') ? 'bg-success' : 'bg-secondary'} text-white d-flex align-items-center justify-content-center mb-1`} style={{ width: '20px', height: '20px', fontSize: '12px' }}>
                          {getStepCompleted(order.status, 'Shipped') ? <i className="bi bi-check"></i> : ''}
                        </div>
                        <small>Shipped</small>
                      </div>

                      <div className="text-center position-relative">
                        <div className={`rounded-circle ${getStepCompleted(order.status, 'Delivered') ? 'bg-success' : 'bg-secondary'} text-white d-flex align-items-center justify-content-center mb-1`} style={{ width: '20px', height: '20px', fontSize: '12px' }}>
                          {getStepCompleted(order.status, 'Delivered') ? <i className="bi bi-check"></i> : ''}
                        </div>
                        <small>Delivered</small>
                      </div>
                    </div>
                  </div>

                  {order.estimatedDelivery && order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                    <div className="alert alert-info mb-3">
                      <small>
                        <i className="bi bi-info-circle me-2"></i>
                        Estimated delivery by {formatDate(order.estimatedDelivery)}
                      </small>
                    </div>
                  )}

                  {order.status === 'Cancelled' && (
                    <div className="alert alert-danger mb-3">
                      <small>
                        <i className="bi bi-x-circle me-2"></i>
                        This order was cancelled {order.cancelledAt ? `on ${formatDate(order.cancelledAt)}` : ''}
                      </small>
                    </div>
                  )}
                </div>
                <div className="card-footer bg-white">
                  <div className="d-flex justify-content-between">
                    <Link to={`/order/${order._id}`} className="btn btn-primary">
                      View Details
                    </Link>
                    {(order.status === 'Processing' || order.status === 'Confirmed') && (
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => handleCancelOrder(order._id)}
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Function to handle order cancellation
  async function handleCancelOrder(orderId) {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      await api.put(`/orders/${orderId}/cancel`, {
        reason: 'Cancelled by customer'
      });
      
      // Update orders list
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId 
            ? { ...order, status: 'Cancelled' } 
            : order
        )
      );
      
      alert('Order cancelled successfully');
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert(err.response?.data?.message || 'Failed to cancel order');
    }
  }
};


export default OrderHistory;