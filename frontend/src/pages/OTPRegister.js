import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import "../styles/OTPAuth.css";

const OTPRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Registration form, 2: OTP verification
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "buyer",
    phone: "",
    businessName: "",
    businessType: ""
  });
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle registration form submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/otp/register", formData);
      setUserId(response.data.userId);
      setStep(2);
      
      // Start countdown for resend button (60 seconds)
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification
  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/otp/login/verify-otp", { userId, otp });
      
      // Store session token
      localStorage.setItem("sessionToken", response.data.sessionToken);
      
      // Store user information
      localStorage.setItem("userId", response.data.user._id);
      localStorage.setItem("name", response.data.user.name || "User");
      localStorage.setItem("email", response.data.user.email);
      
      // Store role
      const role = response.data.user.role || "buyer";
      localStorage.setItem("role", role);
      
      // Redirect to dashboard
      navigate("/dashboard");
      
    } catch (error) {
      setError(error.response?.data?.message || "Invalid verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/otp/resend-otp", { userId });
      
      // Reset countdown
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      const destination = formData.phone
        ? "your email and phone"
        : "your email";
      alert(`A new verification code has been sent to ${destination}.`);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to resend verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Go back to registration form
  const handleBack = () => {
    setStep(1);
    setOtp("");
    setError("");
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <h2 className="mb-1">Create an Account</h2>
                <p className="text-muted">
                  {step === 1 
                    ? "Fill in your details to register" 
                    : "Enter the verification code sent to your email"}
                </p>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {step === 1 ? (
                <form onSubmit={handleRegisterSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="role" className="form-label">Register as</label>
                    <select
                      className="form-select"
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
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
                      className="form-control"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      required
                      disabled={loading}
                    />
                    <div className="form-text">
                      Verification code will be sent to both email and phone (required for login)
                    </div>
                  </div>
                  
                  {(formData.role === 'farmer' || formData.role === 'industry') && (
                    <>
                      <div className="mb-3">
                        <label htmlFor="businessName" className="form-label">
                          {formData.role === 'farmer' ? 'Farm Name' : 'Business Name'}
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="businessName"
                          name="businessName"
                          value={formData.businessName}
                          onChange={handleChange}
                          placeholder={formData.role === 'farmer' ? 'Enter farm name' : 'Enter business name'}
                          disabled={loading}
                        />
                      </div>
                      
                      {formData.role === 'industry' && (
                        <div className="mb-3">
                          <label htmlFor="businessType" className="form-label">Business Type</label>
                          <select
                            className="form-select"
                            id="businessType"
                            name="businessType"
                            value={formData.businessType}
                            onChange={handleChange}
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
                  
                  <div className="d-grid gap-2">
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Registering...
                        </>
                      ) : "Register"}
                    </button>
                  </div>
                  
                  <div className="text-center mt-3">
                    <p>Already have an account? <Link to="/login">Login</Link></p>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleOTPSubmit}>
                  <div className="mb-3">
                    <label htmlFor="otp" className="form-label">Verification Code</label>
                    <input
                      type="text"
                      className="form-control otp-input"
                      id="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit code"
                      maxLength="6"
                      required
                      disabled={loading}
                    />
                    <div className="form-text">
                      {formData.phone
                        ? `We sent a verification code to your email (${formData.email}) and phone (${formData.phone})`
                        : `We sent a verification code to your email (${formData.email})`}
                    </div>
                  </div>
                  
                  <div className="d-grid gap-2">
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Verifying...
                        </>
                      ) : "Verify & Complete Registration"}
                    </button>
                    
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary"
                      onClick={handleBack}
                      disabled={loading}
                    >
                      Back
                    </button>
                  </div>
                  
                  <div className="text-center mt-3">
                    <p>
                      Didn't receive the code?{" "}
                      <button
                        type="button"
                        className="btn btn-link p-0"
                        onClick={handleResendOTP}
                        disabled={countdown > 0 || loading}
                      >
                        Resend
                        {countdown > 0 && ` (${countdown}s)`}
                      </button>
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPRegister;