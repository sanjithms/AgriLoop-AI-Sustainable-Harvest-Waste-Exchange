import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api/axios";

const OTPProtectedRoute = ({ element, allowedRoles }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const sessionToken = localStorage.getItem("sessionToken");
  const role = localStorage.getItem("role");

  // Validate session token on mount and when token changes
  useEffect(() => {
    const validateSession = async () => {
      if (!sessionToken) {
        setIsValidating(false);
        return;
      }

      try {
        // Call the test-auth endpoint to validate the session
        await api.get("/auth/otp/test-auth");

        // If successful, set authenticated to true
        setIsAuthenticated(true);

        // Handle legacy 'user' role and null/undefined role
        const effectiveRole = !role ? 'buyer' : (role === 'user' ? 'buyer' : role);
        setUserRole(effectiveRole);
      } catch (error) {
        console.error("Session validation failed:", error);

        // If session is invalid, clear localStorage
        localStorage.removeItem("sessionToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("name");
        localStorage.removeItem("email");
        localStorage.removeItem("role");
      } finally {
        setIsValidating(false);
      }
    };

    validateSession();
  }, [sessionToken, role]);

  // Show loading while validating
  if (isValidating) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" />;
  }

  // Check if user has the required role
  if (!allowedRoles.includes(userRole)) {
    console.log("User doesn't have required role, redirecting to dashboard");
    // If user is logged in but doesn't have the required role,
    // redirect to dashboard instead of login
    return <Navigate to="/dashboard" />;
  }

  return element;
};

export default OTPProtectedRoute;