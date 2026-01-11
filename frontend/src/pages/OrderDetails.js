import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Meta from '../components/Meta';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/orders/${id}`);
        setOrder(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError(err.response?.data?.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

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
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get progress height for the timeline
  const getProgressHeight = (status) => {
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

  // Handle order cancellation
  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      await api.put(`/orders/${id}/cancel`, {
        reason: 'Cancelled by customer'
      });

      // Update order status
      setOrder(prevOrder => ({
        ...prevOrder,
        status: 'Cancelled',
        cancelledAt: new Date().toISOString()
      }));

      alert('Order cancelled successfully');
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  // Handle reorder - add all items to cart
  const handleReorder = async () => {
    try {
      // Add each product to cart
      for (const item of order.products) {
        await api.post('/cart', {
          productId: item.product,
          quantity: item.quantity
        });
      }

      alert('All items have been added to your cart');
      navigate('/cart');
    } catch (err) {
      console.error('Error reordering:', err);
      alert('Failed to add items to cart. Please try again.');
    }
  };

  // Handle print invoice
  const handlePrintInvoice = () => {
    const printContent = document.getElementById('printableArea');
    // const originalContents = document.body.innerHTML; // Commented out as it's not being used

    if (!printContent) return;

    // Create a print-friendly version
    const printStyles = `
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .invoice-header { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .invoice-title { font-size: 24px; font-weight: bold; color: #333; }
        .invoice-details { margin-bottom: 20px; }
        .invoice-details div { margin-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; }
        .text-end { text-align: right; }
        .fw-bold { font-weight: bold; }
        .total-row { font-weight: bold; border-top: 2px solid #000; }
        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
        @media print {
          body { padding: 0; }
          button { display: none; }
        }
      </style>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - Order #${order.orderNumber}</title>
          ${printStyles}
        </head>
        <body>
          <div class="invoice-header">
            <div>
              <div class="invoice-title">INVOICE</div>
              <div>Smart Agri System</div>
            </div>
            <div>
              <div>Order #: ${order.orderNumber}</div>
              <div>Date: ${formatDate(order.createdAt)}</div>
              <div>Status: ${order.status}</div>
            </div>
          </div>

          <div class="invoice-details">
            <div><strong>Bill To:</strong></div>
            <div>${order.shippingAddress.name}</div>
            <div>${order.shippingAddress.address}</div>
            <div>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}</div>
            <div>${order.shippingAddress.country}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Quantity</th>
                <th class="text-end">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.products.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>₹${item.price.toFixed(2)}</td>
                  <td>${item.quantity}</td>
                  <td class="text-end">₹${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="text-end">Subtotal:</td>
                <td class="text-end">₹${(order.totalAmount - order.taxAmount - order.shippingAmount).toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="3" class="text-end">Tax:</td>
                <td class="text-end">₹${order.taxAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="3" class="text-end">Shipping:</td>
                <td class="text-end">₹${order.shippingAmount.toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                <td colspan="3" class="text-end">Total:</td>
                <td class="text-end">₹${order.totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <div class="invoice-details">
            <div><strong>Payment Information:</strong></div>
            <div>Method: ${order.paymentMethod}</div>
            <div>Status: ${order.paymentDetails.status}</div>
            <div>Transaction ID: ${order.paymentDetails.paymentIntentId}</div>
          </div>

          <div class="footer">
            <p>Thank you for your business!</p>
            <p>For any questions regarding this invoice, please contact support@smartagrisystem.com</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    // Print after a short delay to ensure content is loaded
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
        <Link to="/orders" className="btn btn-primary">
          Back to Orders
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">Order not found</div>
        <Link to="/orders" className="btn btn-primary">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      <Meta title={`Order ${order.orderNumber} | Smart Agri System`} />

      {/* Hidden div for printing */}
      <div id="printableArea" style={{ display: 'none' }}></div>
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Order Details</h2>
        <div>
          <button onClick={handlePrintInvoice} className="btn btn-outline-primary me-2">
            <i className="bi bi-printer me-1"></i> Print Invoice
          </button>
          <Link to="/orders" className="btn btn-outline-secondary">
            Back to Orders
          </Link>
        </div>
      </div>
      
      <div className="row">
        <div className="col-lg-8">
          {/* Order Summary Card */}
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Order #{order.orderNumber}</h5>
              <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                {order.status}
              </span>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-6">
                  <p className="mb-1 text-muted">Order Date</p>
                  <p className="mb-0 fw-bold">{formatDate(order.createdAt)}</p>
                </div>
                <div className="col-md-6">
                  <p className="mb-1 text-muted">Estimated Delivery</p>
                  <p className="mb-0 fw-bold">{formatDate(order.estimatedDelivery)}</p>
                </div>
              </div>
              
              {/* Order Tracking Timeline */}
              <div className="mt-4 mb-3">
                <h6 className="mb-3">Order Tracking</h6>
                <div className="position-relative">
                  <div className="progress position-absolute" style={{ width: '5px', height: '100%', left: '10px' }}>
                    <div
                      className="progress-bar bg-success"
                      style={{
                        height: getProgressHeight(order.status),
                        width: '5px'
                      }}
                    ></div>
                  </div>

                  <div className="ps-5 pb-4 position-relative">
                    <div className={`rounded-circle ${order.status !== 'Cancelled' ? 'bg-success' : 'bg-secondary'} text-white d-flex align-items-center justify-content-center position-absolute`} style={{ width: '25px', height: '25px', left: '0', top: '0' }}>
                      <i className="bi bi-check"></i>
                    </div>
                    <div>
                      <h6 className="mb-0">Order Placed</h6>
                      <p className="text-muted mb-0 small">{formatDate(order.createdAt)}</p>
                      <p className="mb-0 small">Your order has been placed successfully.</p>
                    </div>
                  </div>

                  <div className="ps-5 pb-4 position-relative">
                    <div className={`rounded-circle ${getStepCompleted(order.status, 'Confirmed') ? 'bg-success' : 'bg-secondary'} text-white d-flex align-items-center justify-content-center position-absolute`} style={{ width: '25px', height: '25px', left: '0', top: '0' }}>
                      {getStepCompleted(order.status, 'Confirmed') ? <i className="bi bi-check"></i> : ''}
                    </div>
                    <div>
                      <h6 className="mb-0">Order Confirmed</h6>
                      <p className="text-muted mb-0 small">{getStepCompleted(order.status, 'Confirmed') ? 'Confirmed' : 'Pending'}</p>
                      <p className="mb-0 small">Your order has been confirmed and is being processed.</p>
                    </div>
                  </div>

                  <div className="ps-5 pb-4 position-relative">
                    <div className={`rounded-circle ${getStepCompleted(order.status, 'Shipped') ? 'bg-success' : 'bg-secondary'} text-white d-flex align-items-center justify-content-center position-absolute`} style={{ width: '25px', height: '25px', left: '0', top: '0' }}>
                      {getStepCompleted(order.status, 'Shipped') ? <i className="bi bi-check"></i> : ''}
                    </div>
                    <div>
                      <h6 className="mb-0">Order Shipped</h6>
                      <p className="text-muted mb-0 small">{getStepCompleted(order.status, 'Shipped') ? 'Shipped' : 'Pending'}</p>
                      <p className="mb-0 small">Your order has been shipped and is on the way.</p>
                    </div>
                  </div>

                  <div className="ps-5 position-relative">
                    <div className={`rounded-circle ${getStepCompleted(order.status, 'Delivered') ? 'bg-success' : 'bg-secondary'} text-white d-flex align-items-center justify-content-center position-absolute`} style={{ width: '25px', height: '25px', left: '0', top: '0' }}>
                      {getStepCompleted(order.status, 'Delivered') ? <i className="bi bi-check"></i> : ''}
                    </div>
                    <div>
                      <h6 className="mb-0">Order Delivered</h6>
                      <p className="text-muted mb-0 small">
                        {order.deliveredAt ? formatDate(order.deliveredAt) : (
                          order.status === 'Cancelled' ? 'Cancelled' : 'Expected by ' + formatDate(order.estimatedDelivery)
                        )}
                      </p>
                      <p className="mb-0 small">
                        {order.status === 'Delivered'
                          ? 'Your order has been delivered successfully.'
                          : order.status === 'Cancelled'
                            ? 'This order was cancelled.'
                            : 'Your order will be delivered soon.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {order.status === 'Cancelled' && (
                <div className="alert alert-danger">
                  <i className="bi bi-x-circle-fill me-2"></i>
                  Cancelled on {formatDate(order.cancelledAt)}
                  {order.cancellationReason && (
                    <p className="mb-0 mt-1">Reason: {order.cancellationReason}</p>
                  )}
                </div>
              )}
              
              <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-3">
                {(order.status === 'Processing' || order.status === 'Confirmed') && (
                  <button
                    className="btn btn-danger"
                    onClick={handleCancelOrder}
                  >
                    Cancel Order
                  </button>
                )}

                <button
                  className="btn btn-success"
                  onClick={handleReorder}
                >
                  <i className="bi bi-arrow-repeat me-1"></i> Reorder
                </button>
              </div>
            </div>
          </div>
          
          {/* Order Items */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Order Items</h5>
            </div>
            <div className="card-body">
              {order.products.map((item, index) => (
                <div key={index} className="d-flex mb-3 pb-3 border-bottom">
                  <div className="flex-shrink-0">
                    {item.image ? (
                      <img
                        src={item.image.startsWith('http')
                          ? item.image
                          : `http://localhost:5000/${item.image}`}
                        alt={item.name}
                        className="rounded"
                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                        <i className="bi bi-image text-muted" style={{ fontSize: '1.5rem' }}></i>
                      </div>
                    )}
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="mb-1">{item.name}</h6>
                        <p className="mb-1 text-muted small">
                          Unit Price: ₹{item.price.toFixed(2)} × {item.quantity} {item.quantity > 1 ? 'units' : 'unit'}
                        </p>
                        <Link to={`/product/${item.product}`} className="btn btn-sm btn-outline-primary">
                          <i className="bi bi-eye me-1"></i> View Product
                        </Link>
                      </div>
                      <div className="text-end">
                        <span className="fw-bold">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="d-flex justify-content-between mt-3">
                <span className="fw-bold">Total Items:</span>
                <span>{order.products.reduce((total, item) => total + item.quantity, 0)} items</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-4">
          {/* Order Summary */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Order Summary</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span>₹{(order.totalAmount - order.taxAmount - order.shippingAmount).toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Tax</span>
                <span>₹{order.taxAmount.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span>Shipping</span>
                <span>₹{order.shippingAmount.toFixed(2)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold">
                <span>Total</span>
                <span>₹{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {/* Shipping Information */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Shipping Information</h5>
            </div>
            <div className="card-body">
              <p className="fw-bold mb-1">{order.shippingAddress.name}</p>
              <p className="mb-1">{order.shippingAddress.address}</p>
              <p className="mb-1">
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
              <p className="mb-0">{order.shippingAddress.country}</p>
            </div>
          </div>
          
          {/* Payment Information */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Payment Information</h5>
            </div>
            <div className="card-body">
              <p className="mb-1">
                <span className="fw-bold">Method:</span> {order.paymentMethod}
              </p>
              <p className="mb-1">
                <span className="fw-bold">Status:</span> {order.paymentDetails.status}
              </p>
              <p className="mb-0">
                <span className="fw-bold">Transaction ID:</span>
                <br />
                <small className="text-muted">{order.paymentDetails.paymentIntentId}</small>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;