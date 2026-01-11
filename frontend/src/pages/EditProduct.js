import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useParams, useNavigate } from "react-router-dom";

const EditProduct = () => {
  const { id } = useParams(); // Get product ID from URL
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    unit: "kg",
    stock: ""
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Fetch product details to pre-fill the form
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null); // Clear previous errors
        const res = await api.get(`/products/${id}`);
        if (!res.data) {
          throw new Error('Product not found');
        }
        setFormData({
          name: res.data.name || "",
          description: res.data.description || "",
          category: res.data.category || "",
          price: res.data.price || "",
          unit: res.data.unit || "kg",
          stock: res.data.stock || ""
        });
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err.response?.data?.message || "Failed to load product details. Please try again.");
        navigate('/products'); // Redirect if product not found
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, navigate]);

  const validateForm = () => {
    if (!formData.name.trim()) return "Product name is required";
    if (!formData.category) return "Category is required";
    if (isNaN(formData.price) || Number(formData.price) <= 0) return "Valid price is required";
    if (isNaN(formData.stock) || Number(formData.stock) < 0) return "Valid stock quantity is required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const sanitizedData = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock)
      };

      const response = await api.put(`/products/${id}`, sanitizedData);
      if (!response.data) {
        throw new Error('Failed to update product');
      }
      alert("Product updated successfully!");
      navigate("/products");
    } catch (err) {
      console.error("Error updating product:", err);
      setError(
        err.response?.data?.message || 
        err.message || 
        "Failed to update product. Please check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Edit Product</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="text-center">
          <p>Loading product details...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
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
              disabled={submitting}
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
              disabled={submitting}
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
              disabled={submitting}
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
                disabled={submitting}
              />
              <select
                className="form-select"
                style={{ maxWidth: '120px' }}
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
                disabled={submitting}
              >
                <option value="kg">kg</option>
                <option value="liters">liters</option>
                <option value="pieces">pieces</option>
                <option value="ton">ton</option>
                <option value="grams">grams</option>
                <option value="ml">ml</option>
              </select>
            </div>
            <div className="form-text">Enter unit of measurement (e.g., kg, liters, pieces)</div>
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
              disabled={submitting}
            />
          </div>

          <div className="d-flex justify-content-between">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/products")}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-success"
              disabled={submitting}
            >
              {submitting ? "Updating..." : "Update Product"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditProduct;
