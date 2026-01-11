import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Meta from "../components/Meta";

const AdminPanel = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    ordersByStatus: [],
    ordersByDate: [],
    totalRevenue: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  const [statsLoading, setStatsLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const productsPerPage = 5;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products");
      setProducts(res.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders?limit=5");
      setOrders(res.data.orders);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders");
    }
  };

  const fetchOrderStats = async () => {
    try {
      setStatsLoading(true);
      const res = await api.get("/orders/stats/dashboard");
      setOrderStats(res.data);
    } catch (err) {
      console.error("Error fetching order statistics:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this product?");
    if (confirmed) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (err) {
        console.error("Error deleting product:", err);
        alert("Failed to delete product");
      }
    }
  };

  const handleOrderStatusChange = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      fetchOrders();
    } catch (err) {
      console.error("Error updating order status:", err);
      alert("Failed to update order status");
    }
  };

  // Helper function to get badge color for order status
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Processing': return 'info';
      case 'Confirmed': return 'primary';
      case 'Shipped': return 'warning';
      case 'Delivered': return 'success';
      case 'Cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  const filteredProducts = products
    .filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterCategory === "" || product.category === filterCategory)
    )
    .sort((a, b) => {
      if (sortOption === "priceLowToHigh") return a.price - b.price;
      if (sortOption === "priceHighToLow") return b.price - a.price;
      if (sortOption === "stockLowToHigh") return a.stock - b.stock;
      if (sortOption === "stockHighToLow") return b.stock - a.stock;
      return 0;
    });

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchOrderStats();
  }, []);

  return (
    <div className="container-fluid mt-5">
      <Meta title="Admin Panel | Smart Agri System" />

      <h2 className="mb-4">Admin Dashboard</h2>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Total Orders</h6>
                  <h3 className="mb-0">{statsLoading ? '...' : orderStats.totalOrders}</h3>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <i className="bi bi-bag text-primary fs-3"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Total Revenue</h6>
                  <h3 className="mb-0">₹{statsLoading ? '...' : orderStats.totalRevenue.toFixed(2)}</h3>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <i className="bi bi-currency-rupee text-success fs-3"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Products</h6>
                  <h3 className="mb-0">{products.length}</h3>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded">
                  <i className="bi bi-box-seam text-warning fs-3"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Pending Orders</h6>
                  <h3 className="mb-0">
                    {statsLoading ? '...' :
                      orderStats.ordersByStatus?.find(o => o._id === 'Processing')?.count || 0}
                  </h3>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded">
                  <i className="bi bi-hourglass-split text-info fs-3"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Quick Actions</h5>
              <div className="d-flex flex-wrap gap-2">
                <Link to="/add-product" className="btn btn-success">
                  <i className="bi bi-plus-circle me-2"></i> Add New Product
                </Link>
                <Link to="/orders" className="btn btn-primary">
                  <i className="bi bi-bag me-2"></i> Manage Orders
                </Link>
                <button className="btn btn-info text-white">
                  <i className="bi bi-people me-2"></i> Manage Users
                </button>
                <button className="btn btn-warning text-white">
                  <i className="bi bi-graph-up me-2"></i> View Reports
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          className="form-control mb-3"
          placeholder="Search by Product Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="form-control mb-3"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Fertilizer">Fertilizer</option>
          <option value="Seeds">Seeds</option>
          <option value="Equipment">Equipment</option>
          <option value="Waste Product">Waste Product</option>
        </select>
        <select
          className="form-control mb-3"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="">Sort By</option>
          <option value="priceLowToHigh">Price: Low to High</option>
          <option value="priceHighToLow">Price: High to Low</option>
          <option value="stockLowToHigh">Stock: Low to High</option>
          <option value="stockHighToLow">Stock: High to Low</option>
        </select>
      </div>

      <h3>Manage Products</h3>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentProducts.map((product) => (
            <tr key={product._id}>
              <td>{product.name}</td>
              <td>₹{product.price}</td>
              <td>{product.stock}</td>
              <td>
                <button
                  className="btn btn-warning me-2"
                  onClick={() => window.location.href = `/edit-product/${product._id}`}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDeleteProduct(product._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        {Array.from({ length: Math.ceil(filteredProducts.length / productsPerPage) }, (_, i) => (
          <button
            key={i}
            className={`btn ${currentPage === i + 1 ? "btn-primary" : "btn-light"} mx-1`}
            onClick={() => handlePageChange(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Orders</h5>
              <Link to="/orders" className="btn btn-sm btn-outline-primary">
                View All Orders
              </Link>
            </div>
            <div className="card-body p-0">
              {orders.length === 0 ? (
                <div className="text-center py-4">
                  <p className="mb-0">No orders found</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Order #</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order._id}>
                          <td>{order.orderNumber || order._id.substring(0, 8)}</td>
                          <td>{order.buyer?.name || 'Unknown'}</td>
                          <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td>₹{order.totalAmount.toFixed(2)}</td>
                          <td>
                            <span className={`badge bg-${getStatusBadge(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Link to={`/order/${order._id}`} className="btn btn-sm btn-outline-primary">
                                View
                              </Link>
                              <select
                                className="form-select form-select-sm"
                                style={{ width: '130px' }}
                                value={order.status}
                                onChange={(e) => handleOrderStatusChange(order._id, e.target.value)}
                              >
                                <option value="Processing">Processing</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
