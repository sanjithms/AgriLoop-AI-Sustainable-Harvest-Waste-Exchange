import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import pages
import Home from "./pages/Home";
import Product from "./pages/Product";
import ProductDetails from "./pages/ProductDetails"; // Using only one product detail component
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import Checkout from "./pages/Checkout";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import AdminOrders from "./pages/AdminOrders";
// Import authentication pages
import OTPLogin from "./pages/OTPLogin";
import OTPRegister from "./pages/OTPRegister";
import OrderHistory from "./pages/OrderHistory";
import OrderDetails from "./pages/OrderDetails";
import UserProfile from "./pages/UserProfile";
import Waste from "./pages/Waste";
import WasteProductDetail from "./pages/WasteProductDetail";
import AddWasteProduct from "./pages/AddWasteProduct";
import EditWasteProduct from "./pages/EditWasteProduct";
import NotificationsPage from "./pages/NotificationsPage";
import ImageDebug from "./pages/ImageDebug";
import WasteAnalyzerPage from "./pages/WasteAnalyzerPage";
import OptimizedWasteAwarenessPage from "./pages/OptimizedWasteAwarenessPage";
import NewAwareness from "./pages/NewAwareness";
import ApiDebugPage from "./pages/ApiDebugPage";

// Import components
import OTPProtectedRoute from "./components/OTPProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SalesChart from "./components/SalesChart";
import Cart from "./components/Cart";

function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        {/* Toast notifications replaced with browser alerts */}
        <Navbar />
        <div className="flex-grow-1">
          <Routes>
            {/* Authentication routes */}
            <Route path="/register" element={<OTPRegister />} />
            <Route path="/login" element={<OTPLogin />} />

            {/* Public routes */}
            <Route path="/product-details/:id" element={<ProductDetails />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/sales-analytics" element={<SalesChart />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/waste" element={<Waste />} />
            <Route path="/wastes" element={<Waste />} />
            <Route path="/waste-analyzer" element={<WasteAnalyzerPage />} />
            <Route path="/waste-awareness" element={<OptimizedWasteAwarenessPage />} />
            <Route path="/awareness" element={<NewAwareness />} />
            <Route path="/waste-products/:id" element={<WasteProductDetail />} />
            <Route path="/products" element={<Product />} />
            <Route path="/debug/images" element={<ImageDebug />} />
            <Route path="/debug/api" element={<ApiDebugPage />} />
            <Route path="/" element={<Home />} />

            {/* Protected routes with OTP authentication */}
            <Route path="/dashboard" element={<OTPProtectedRoute element={<Dashboard />} allowedRoles={["buyer", "admin", "farmer", "industry"]} />} />
            <Route path="/admin" element={<OTPProtectedRoute element={<AdminPanel />} allowedRoles={["admin"]} />} />
            <Route path="/admin/orders" element={<OTPProtectedRoute element={<AdminOrders />} allowedRoles={["admin"]} />} />
            <Route path="/checkout" element={<OTPProtectedRoute element={<Checkout />} allowedRoles={["buyer", "admin", "farmer", "industry"]} />} />
            <Route path="/orders" element={<OTPProtectedRoute element={<OrderHistory />} allowedRoles={["buyer", "admin", "farmer", "industry"]} />} />
            <Route path="/order/:id" element={<OTPProtectedRoute element={<OrderDetails />} allowedRoles={["buyer", "admin", "farmer", "industry"]} />} />
            <Route path="/profile" element={<OTPProtectedRoute element={<UserProfile />} allowedRoles={["buyer", "admin", "farmer", "industry"]} />} />
            <Route path="/notifications" element={<OTPProtectedRoute element={<NotificationsPage />} allowedRoles={["buyer", "admin", "farmer", "industry"]} />} />
            <Route path="/waste-products/add" element={<OTPProtectedRoute element={<AddWasteProduct />} allowedRoles={["farmer", "industry"]} />} />
            <Route path="/waste-products/edit/:id" element={<OTPProtectedRoute element={<EditWasteProduct />} allowedRoles={["farmer", "industry", "admin"]} />} />
            <Route path="/edit-product/:id" element={<OTPProtectedRoute element={<EditProduct />} allowedRoles={["admin", "farmer"]} />} />
            <Route path="/add-product" element={<OTPProtectedRoute element={<AddProduct />} allowedRoles={["admin", "farmer", "industry"]} />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
