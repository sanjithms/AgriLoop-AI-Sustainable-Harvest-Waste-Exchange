import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import "../styles/OTPAuth.css";

const OTPLogin = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email/Password entry, 2: OTP verification
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Handle password verification (Step 1)
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // First verify the password
      const passwordResponse = await api.post("/auth/otp/login/verify-password", {
        email,
        password
      });

      // Save the user ID from the password verification response
      setUserId(passwordResponse.data.userId);

      // Now request the OTP
      await api.post("/auth/otp/login/request-otp", {
        userId: passwordResponse.data.userId
      });

      // Move to OTP verification step
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
      setError(error.response?.data?.message || "Invalid email or password. Please try again.");
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
      
      // Redirect based on role
      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
      
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
      // Request a new OTP using the userId from the password verification step
      await api.post("/auth/otp/login/request-otp", { userId });

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

      alert("A new verification code has been sent to your email and phone.");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to resend verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Go back to email step
  const handleBack = () => {
    setStep(1);
    setOtp("");
    setError("");
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <h2 className="mb-1">Login</h2>
                <p className="text-muted">
                  {step === 1
                    ? "Enter your email and password to continue"
                    : "Enter the verification code sent to your email and phone"}
                </p>
                {step === 2 && (
                  <div className="badge bg-success mb-2">Step 2 of 2: Two-Factor Authentication</div>
                )}
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {step === 1 ? (
                <form onSubmit={handlePasswordSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email address</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      disabled={loading}
                    />
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
                      ) : "Continue"}
                    </button>
                  </div>
                  <div className="text-center mt-3">
                    <p>Don't have an account? <Link to="/register">Register</Link></p>
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
                      We sent a verification code to your email and phone (if registered)
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
                      ) : "Verify & Login"}
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

export default OTPLogin;