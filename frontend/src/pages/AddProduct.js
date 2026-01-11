import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { getImageUrl } from "../utils/imageUtils";

const AddProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    unit: "kg",
    stock: "",
    category: "",
    description: "",
    organic: false,
    harvestDate: "",
    expiryDate: "",
    farmLocation: "",
    cultivationMethod: "",
    // Industry-specific fields
    manufacturingDate: "",
    shelfLife: "",
    storageInstructions: "",
    specifications: "",
    certifications: ""
  });

  const [userRole, setUserRole] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get user role and check authentication when component mounts
  useEffect(() => {
    const sessionToken = localStorage.getItem("sessionToken");
    const role = localStorage.getItem("role");

    // Check if user is authenticated
    if (!sessionToken) {
      setError("You must be logged in to add products");
      // Optional: Redirect to login page
      // navigate('/login');
    } else if (role !== 'farmer' && role !== 'industry') {
      setError("Only farmers and industry users can add products");
    }

    setUserRole(role || "");

    // Log authentication status for debugging
    console.log("Auth status:", {
      hasSessionToken: !!sessionToken,
      role: role
    });
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      // Create a preview URL for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate image
    if (!image) {
      setError("Please upload an image for the product");
      setLoading(false);
      return;
    }

    try {
      // Create FormData object to handle file upload
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("unit", formData.unit);
      formDataToSend.append("stock", formData.stock);
      
formDataToSend.append("productImage", image);

      // Add farmer-specific fields
      formDataToSend.append("organic", formData.organic);
      if (formData.harvestDate) formDataToSend.append("harvestDate", formData.harvestDate);
      if (formData.expiryDate) formDataToSend.append("expiryDate", formData.expiryDate);
      if (formData.farmLocation) formDataToSend.append("farmLocation", formData.farmLocation);
      if (formData.cultivationMethod) formDataToSend.append("cultivationMethod", formData.cultivationMethod);

      // Add industry-specific fields
      if (formData.manufacturingDate) formDataToSend.append("manufacturingDate", formData.manufacturingDate);
      if (formData.shelfLife) formDataToSend.append("shelfLife", formData.shelfLife);
      if (formData.storageInstructions) formDataToSend.append("storageInstructions", formData.storageInstructions);
      if (formData.specifications) formDataToSend.append("specifications", formData.specifications);
      if (formData.certifications) formDataToSend.append("certifications", formData.certifications);

      // Log the FormData (for debugging)
      console.log("Sending product data:");
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
      }

      // Get the session token from localStorage
      const sessionToken = localStorage.getItem('sessionToken');

      if (!sessionToken) {
        setError("You must be logged in to add a product");
        setLoading(false);
        return;
      }

      // Debug authentication
      console.log("Authentication token being used:", sessionToken ? "Token exists" : "No token");
      console.log("User role:", localStorage.getItem("role"));

      await api.post("/products", formDataToSend, {
        headers: {
          // Don't set Content-Type when sending FormData
          // The browser will automatically set the correct Content-Type with boundary
          Authorization: `Bearer ${sessionToken}`
        }
      });

      alert("Product Added Successfully!");
      navigate("/products");
    } catch (error) {
      console.error("Error adding product:", error);

      // Handle different error scenarios
      if (error.response?.status === 401) {
        setError("Authentication failed. Please log in again with OTP verification.");

        // Clear token if authentication failed
        localStorage.removeItem('sessionToken');
      } else if (error.response?.status === 403) {
        setError("You don't have permission to add products. Only farmers and industry users can add products.");
      } else {
        setError(error.response?.data?.message || "Failed to add product. Please try again.");
      }

      // Log detailed error information for debugging
      console.log("Error details:", {
        message: error.message,
        status: error.response?.status,
        responseData: error.response?.data,
        authStatus: {
          sessionToken: !!localStorage.getItem("sessionToken"),
          role: localStorage.getItem("role")
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Add New Product</h2>

      {error && (
        <div className="alert alert-danger">
          <strong>Error:</strong> {error}
          {(error.includes("logged in") || error.includes("authentication")) && (
            <div className="mt-2">
              <button
                className="btn btn-sm btn-primary"
                onClick={() => navigate("/login")}
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      )}

      {userRole !== 'farmer' && userRole !== 'industry' && userRole !== '' && (
        <div className="alert alert-warning">
          <strong>Note:</strong> Only farmers and industry users can add products. Your current role is: {userRole}.
        </div>
      )}

      <form onSubmit={handleAddProduct}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Product Name:</label>
          <input
            type="text"
            className="form-control"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description:</label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            disabled={loading}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="price" className="form-label">Price (₹):</label>
          <div className="input-group">
            <input
              type="number"
              className="form-control"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              disabled={loading}
            />
            <select
              className="form-select"
              style={{ maxWidth: '120px' }}
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="kg">kg</option>
              <option value="liters">liters</option>
              <option value="pieces">pieces</option>
              <option value="ton">ton</option>
              <option value="grams">grams</option>
              <option value="ml">ml</option>
            </select>
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="stock" className="form-label">Stock:</label>
          <input
            type="number"
            className="form-control"
            id="stock"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            required
            min="0"
            disabled={loading}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="category" className="form-label">Category:</label>
          <select
            className="form-select"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="">Select a category</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Fruits">Fruits</option>
            <option value="Grains">Grains</option>
            <option value="Dairy">Dairy</option>
            <option value="Poultry">Poultry</option>
            <option value="Seeds">Seeds</option>
            <option value="Fertilizer">Fertilizer</option>
            <option value="Equipment">Equipment</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Conditional rendering based on user role */}
        {userRole === "farmer" && (
          <>
            <div className="mb-3 form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="organic"
                name="organic"
                checked={formData.organic}
                onChange={(e) => setFormData({...formData, organic: e.target.checked})}
                disabled={loading}
              />
              <label className="form-check-label" htmlFor="organic">Organic Product</label>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="harvestDate" className="form-label">Harvest Date:</label>
                <input
                  type="date"
                  className="form-control"
                  id="harvestDate"
                  name="harvestDate"
                  value={formData.harvestDate}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="expiryDate" className="form-label">Expiry Date:</label>
                <input
                  type="date"
                  className="form-control"
                  id="expiryDate"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="farmLocation" className="form-label">Farm Location:</label>
              <input
                type="text"
                className="form-control"
                id="farmLocation"
                name="farmLocation"
                value={formData.farmLocation}
                onChange={handleChange}
                disabled={loading}
                placeholder="e.g., Village, District, State"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="cultivationMethod" className="form-label">Cultivation Method:</label>
              <select
                className="form-select"
                id="cultivationMethod"
                name="cultivationMethod"
                value={formData.cultivationMethod}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Select a cultivation method</option>
                <option value="Traditional">Traditional</option>
                <option value="Organic">Organic</option>
                <option value="Hydroponic">Hydroponic</option>
                <option value="Greenhouse">Greenhouse</option>
                <option value="Permaculture">Permaculture</option>
              </select>
            </div>
          </>
        )}

        {/* Industry-specific fields */}
        {userRole === "industry" && (
          <>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="manufacturingDate" className="form-label">Manufacturing Date:</label>
                <input
                  type="date"
                  className="form-control"
                  id="manufacturingDate"
                  name="manufacturingDate"
                  value={formData.manufacturingDate}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="shelfLife" className="form-label">Shelf Life (months):</label>
                <input
                  type="number"
                  className="form-control"
                  id="shelfLife"
                  name="shelfLife"
                  value={formData.shelfLife}
                  onChange={handleChange}
                  disabled={loading}
                  min="1"
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="storageInstructions" className="form-label">Storage Instructions:</label>
              <textarea
                className="form-control"
                id="storageInstructions"
                name="storageInstructions"
                value={formData.storageInstructions}
                onChange={handleChange}
                rows="2"
                disabled={loading}
                placeholder="e.g., Store in a cool, dry place"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="specifications" className="form-label">Product Specifications:</label>
              <textarea
                className="form-control"
                id="specifications"
                name="specifications"
                value={formData.specifications}
                onChange={handleChange}
                rows="3"
                disabled={loading}
                placeholder="e.g., Dimensions, weight, materials, etc."
              />
            </div>

            <div className="mb-3">
              <label htmlFor="certifications" className="form-label">Certifications:</label>
              <input
                type="text"
                className="form-control"
                id="certifications"
                name="certifications"
                value={formData.certifications}
                onChange={handleChange}
                disabled={loading}
                placeholder="e.g., ISO 9001, BIS, etc."
              />
            </div>
          </>
        )}

        {/* Show both sections for admin users */}
        {userRole === "admin" && (
          <>
            <div className="mb-3 form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="organic"
                name="organic"
                checked={formData.organic}
                onChange={(e) => setFormData({...formData, organic: e.target.checked})}
                disabled={loading}
              />
              <label className="form-check-label" htmlFor="organic">Organic Product</label>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="harvestDate" className="form-label">Harvest Date:</label>
                <input
                  type="date"
                  className="form-control"
                  id="harvestDate"
                  name="harvestDate"
                  value={formData.harvestDate}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="expiryDate" className="form-label">Expiry Date:</label>
                <input
                  type="date"
                  className="form-control"
                  id="expiryDate"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="farmLocation" className="form-label">Farm Location:</label>
              <input
                type="text"
                className="form-control"
                id="farmLocation"
                name="farmLocation"
                value={formData.farmLocation}
                onChange={handleChange}
                disabled={loading}
                placeholder="e.g., Village, District, State"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="cultivationMethod" className="form-label">Cultivation Method:</label>
              <select
                className="form-select"
                id="cultivationMethod"
                name="cultivationMethod"
                value={formData.cultivationMethod}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Select a cultivation method</option>
                <option value="Traditional">Traditional</option>
                <option value="Organic">Organic</option>
                <option value="Hydroponic">Hydroponic</option>
                <option value="Greenhouse">Greenhouse</option>
                <option value="Permaculture">Permaculture</option>
              </select>
            </div>
          </>
        )}

        <div className="mb-3">
          <label htmlFor="image" className="form-label">Product Image:</label>
          <input
            type="file"
            className="form-control"
            id="image"
            name="productImage"
            accept="image/*"
            onChange={handleImageChange}
            disabled={loading}
            required
          />
          {imagePreview && (
            <div className="mt-2">
              <img
                src={imagePreview}
                alt="Product Preview"
                style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                className="border rounded"
                onError={(e) => {
                  console.error('Image preview failed to load');
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                }}
              />
            </div>
          )}
        </div>

        <div className="d-flex justify-content-between">
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => navigate("/products")}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading || (userRole !== 'farmer' && userRole !== 'industry')}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Adding Product...
              </>
            ) : (userRole !== 'farmer' && userRole !== 'industry') ? (
              "Only Farmers and Industry Users Can Submit"
            ) : (
              "Add Product"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
