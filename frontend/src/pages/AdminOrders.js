import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Meta from '../components/Meta';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter, dateRange]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      let queryParams = `?page=${currentPage}&limit=10`;
      if (statusFilter) {
        queryParams += `&status=${statusFilter}`;
      }
      if (dateRange.startDate && dateRange.endDate) {
        queryParams += `&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      }
      
      const response = await api.get(`/orders${queryParams}`);
      setOrders(response.data.orders);
      setTotalPages(response.data.pages);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus, notes = '') => {
    try {
      await api.put(`/orders/${orderId}/status`, {
        status: newStatus,
        notes: notes
      });

      // Update order in state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId
            ? {
                ...order,
                status: newStatus,
                notes: notes ? (order.notes ? `${order.notes}, ${notes}` : notes) : order.notes,
                deliveredAt: newStatus === 'Delivered' ? new Date().toISOString() : order.deliveredAt
              }
            : order
        )
      );

      alert(`Order status updated to ${newStatus}${notes ? ' with notes' : ''}`);
    } catch (err) {
      console.error('Error updating order status:', err);
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
    setCurrentPage(1); // Reset to first page when date range changes
  };

  const clearFilters = () => {
    setStatusFilter('');
    setDateRange({ startDate: '', endDate: '' });
    setCurrentPage(1);
  };

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
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="container-fluid mt-4 mb-5">
      <Meta title="Manage Orders | Admin" />
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Order Management</h2>
        <Link to="/admin" className="btn btn-outline-secondary">
          Back to Dashboard
        </Link>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label htmlFor="statusFilter" className="form-label">Filter by Status</label>
              <select 
                id="statusFilter"
                className="form-select" 
                value={statusFilter} 
                onChange={handleFilterChange}
              >
                <option value="">All Statuses</option>
                <option value="Processing">Processing</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="col-md-3">
              <label htmlFor="startDate" className="form-label">Start Date</label>
              <input 
                type="date" 
                id="startDate"
                className="form-control" 
                name="startDate"
                value={dateRange.startDate} 
                onChange={handleDateChange}
              />
            </div>
            
            <div className="col-md-3">
              <label htmlFor="endDate" className="form-label">End Date</label>
              <input 
                type="date" 
                id="endDate"
                className="form-control" 
                name="endDate"
                value={dateRange.endDate} 
                onChange={handleDateChange}
              />
            </div>
            
            <div className="col-md-3 d-flex align-items-end">
              <button 
                className="btn btn-secondary w-100"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Orders Table */}
      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="alert alert-info">
          No orders found matching the selected filters.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td>
                    <span className="d-block">{order.orderNumber || order._id.substring(0, 8)}</span>
                    <small className="text-muted">{order._id}</small>
                  </td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>
                    {order.buyer?.name || 'Unknown'}
                    <br />
                    <small className="text-muted">{order.buyer?.email}</small>
                  </td>
                  <td>₹{order.totalAmount.toFixed(2)}</td>
                  <td>
                    <select 
                      className={`form-select form-select-sm bg-${getStatusBadgeClass(order.status).replace('bg-', '')}`}
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    >
                      <option value="Processing">Processing</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <Link to={`/order/${order._id}`} className="btn btn-sm btn-outline-primary me-2">
                      View
                    </Link>
                    <button 
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => {
                        const notes = prompt('Add notes for this order:');
                        if (notes) {
                          handleStatusChange(order._id, order.status, notes);
                        }
                      }}
                    >
                      Add Note
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
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
    </div>
  );
};

export default AdminOrders;