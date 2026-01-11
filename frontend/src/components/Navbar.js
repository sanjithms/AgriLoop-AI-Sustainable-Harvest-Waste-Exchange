// eslint-disable-next-line no-unused-vars
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import { updateCartBadge } from "../utils/cartUtils";
import "../styles/Navbar.css"; // Import the CSS file

const Navbar = () => {
  const navigate = useNavigate();
  // Check for authentication
  const isLoggedIn = localStorage.getItem("sessionToken");
  const userRole = localStorage.getItem("role");

  // Initialize cart badge when component mounts
  useEffect(() => {
    updateCartBadge();
  }, []);

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem("sessionToken");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("name");
    localStorage.removeItem("email");

    // Redirect to login
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <Link className="navbar-brand" to="/">Smart Agri System</Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link to="/" className="nav-link">Home</Link>
            </li>
            <li className="nav-item">
              <Link to="/products" className="nav-link">Products</Link>
            </li>
            <li className="nav-item">
              <Link to="/wastes" className="nav-link">
                <i className="bi bi-recycle me-1"></i>
                Wastes
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/waste-awareness" className="nav-link">
                <i className="bi bi-lightbulb me-1"></i>
                Waste Awareness
              </Link>
            </li>
            <li className="nav-item dropdown">
              {/* Using # as href can cause accessibility issues, using button instead */}
              <button className="nav-link dropdown-toggle" id="aiToolsDropdown" data-bs-toggle="dropdown" aria-expanded="false" style={{ background: 'none', border: 'none' }}>
                AI Tools
              </button>
              <ul className="dropdown-menu" aria-labelledby="aiToolsDropdown">
                <li>
                  <Link to="/waste-analyzer" className="dropdown-item">
                    <i className="bi bi-recycle me-2"></i>
                    Waste Analyzer
                  </Link>
                </li>
                <li>
                  <Link to="/ai-advisor" className="dropdown-item">
                    <i className="bi bi-robot me-2"></i>
                    Agricultural Advisor
                  </Link>
                </li>
              </ul>
            </li>
            {userRole === "admin" && (
              <li className="nav-item">
                <Link to="/admin" className="nav-link">Admin Panel</Link>
              </li>
            )}
            {(userRole === "farmer" || userRole === "admin" || userRole === "industry") && (
              <li className="nav-item">
                <Link to="/add-product" className="nav-link">Add Product</Link>
              </li>
            )}
          </ul>

          <ul className="navbar-nav mx-3">
            <li className="nav-item">
              <Link to="/cart" className="nav-link position-relative">
                <i className="bi bi-cart"></i> Cart
                <span id="cart-badge" className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  0
                  <span className="visually-hidden">items in cart</span>
                </span>
              </Link>
            </li>
          </ul>

          <ul className="navbar-nav">
            {!isLoggedIn ? (
              <>
                <li className="nav-item">
                  <Link to="/register" className="nav-link">Register</Link>
                </li>
                <li className="nav-item">
                  <Link to="/login" className="nav-link">Login</Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NotificationBell />
                </li>
                <li className="nav-item">
                  <Link to="/dashboard" className="nav-link">Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link to="/orders" className="nav-link">My Orders</Link>
                </li>
                <li className="nav-item">
                  <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
