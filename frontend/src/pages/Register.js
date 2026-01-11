import { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "buyer", // Default role
    phone: "",
    businessName: "",
    businessType: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/register", formData);
      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Register</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            required
            className="form-control"
            disabled={loading}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
            className="form-control"
            disabled={loading}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="form-control"
            disabled={loading}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="role" className="form-label">Register as</label>
          <select
            id="role"
            name="role"
            className="form-select"
            onChange={handleChange}
            value={formData.role}
            disabled={loading}
          >
            <option value="buyer">Buyer</option>
            <option value="farmer">Farmer</option>
            <option value="industry">Industry/Waste Processor</option>
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="phone" className="form-label">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            placeholder="Phone Number"
            onChange={handleChange}
            className="form-control"
            disabled={loading}
          />
        </div>

        {(formData.role === 'farmer' || formData.role === 'industry') && (
          <>
            <div className="mb-3">
              <label htmlFor="businessName" className="form-label">
                {formData.role === 'farmer' ? 'Farm Name' : 'Business Name'}
              </label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                placeholder={formData.role === 'farmer' ? 'Farm Name' : 'Business Name'}
                onChange={handleChange}
                className="form-control"
                disabled={loading}
              />
            </div>

            {formData.role === 'industry' && (
              <div className="mb-3">
                <label htmlFor="businessType" className="form-label">Business Type</label>
                <select
                  id="businessType"
                  name="businessType"
                  className="form-select"
                  onChange={handleChange}
                  value={formData.businessType}
                  disabled={loading}
                >
                  <option value="">Select Business Type</option>
                  <option value="Waste Processing">Waste Processing</option>
                  <option value="Recycling">Recycling</option>
                  <option value="Composting">Composting</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}
          </>
        )}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        <div className="mt-3">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
