import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Meta from "../components/Meta";

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log("Fetching orders...");

      // The token is automatically added by the axios interceptor
      const response = await api.get("/orders/myorders");
      console.log("Orders response:", response.data);

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
      console.error("Error fetching orders:", err);
      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else {
        setError("Failed to load your orders. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // The authentication is handled by the OTPProtectedRoute component
    // No need to check for token here
    fetchOrders();
  }, []);

  return (
    <div className="container mt-5">
      <Meta title="My Dashboard | Smart Agri System" />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Dashboard</h2>
        <Link to="/orders" className="btn btn-outline-primary">
          View All Orders
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* User Stats */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="display-4 text-primary mb-2">
                <i className="bi bi-bag"></i>
              </div>
              <h5>Total Orders</h5>
              <p className="display-6 fw-bold mb-0">{orders ? orders.length : 0}</p>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="display-4 text-success mb-2">
                <i className="bi bi-check-circle"></i>
              </div>
              <h5>Completed Orders</h5>
              <p className="display-6 fw-bold mb-0">
                {orders ? orders.filter(order => order.status === 'Delivered').length : 0}
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="display-4 text-warning mb-2">
                <i className="bi bi-truck"></i>
              </div>
              <h5>In Progress</h5>
              <p className="display-6 fw-bold mb-0">
                {orders ? orders.filter(order =>
                  ['Processing', 'Confirmed', 'Shipped'].includes(order.status)
                ).length : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3 className="mb-0">Recent Orders</h3>
          <Link to="/orders" className="btn btn-sm btn-outline-primary">
            View All
          </Link>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading your orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-4">
              <div className="mb-3">
                <i className="bi bi-bag-x" style={{ fontSize: '3rem' }}></i>
              </div>
              <h5>You haven't placed any orders yet</h5>
              <p className="text-muted">Browse our products and place your first order!</p>
              <Link to="/products" className="btn btn-primary mt-2">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Order #</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders && orders.length > 0 ? orders.slice(0, 5).map((order) => (
                    <tr key={order._id}>
                      <td>{order.orderNumber || order._id.substring(0, 8)}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>₹{order.totalAmount.toFixed(2)}</td>
                      <td>
                        <span className={`badge bg-${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <Link to={`/order/${order._id}`} className="btn btn-sm btn-outline-primary">
                          Details
                        </Link>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="text-center">No orders found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Account Information */}
      <div className="card">
        <div className="card-header">
          <h3 className="mb-0">Account Information</h3>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h5>Personal Information</h5>
              <p><strong>Name:</strong> {localStorage.getItem('name') || 'User'}</p>
              <p><strong>Email:</strong> {localStorage.getItem('email') || 'user@example.com'}</p>
              <p><strong>Role:</strong> {localStorage.getItem('role') || 'User'}</p>
              <Link to="/profile" className="btn btn-outline-primary">Edit Profile</Link>
            </div>
            <div className="col-md-6">
              <h5>Account Actions</h5>
              <div className="d-grid gap-2">
                <Link to="/orders" className="btn btn-outline-secondary">
                  <i className="bi bi-bag me-2"></i> My Orders
                </Link>
                <button className="btn btn-outline-secondary">
                  <i className="bi bi-heart me-2"></i> My Wishlist
                </button>
                <button className="btn btn-outline-secondary">
                  <i className="bi bi-shield-lock me-2"></i> Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get appropriate color for order status
const getStatusColor = (status) => {
  switch (status) {
    case 'Delivered':
      return 'success';
    case 'Shipped':
      return 'info';
    case 'Processing':
      return 'primary';
    case 'Pending':
      return 'warning';
    case 'Cancelled':
      return 'danger';
    default:
      return 'secondary';
  }
};


export default Dashboard;
