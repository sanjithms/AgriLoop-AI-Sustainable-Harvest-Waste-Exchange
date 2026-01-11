import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import OTPProtectedRoute from "./OTPProtectedRoute";

// This component is deprecated. Use OTPProtectedRoute.js instead.

const ProtectedRoute = (props) => {
  const location = useLocation();

  useEffect(() => {
    console.warn("ProtectedRoute is deprecated. Please use OTPProtectedRoute instead.");
  }, []);

  // Forward to the new OTPProtectedRoute component
  return <OTPProtectedRoute {...props} />;
};

export default ProtectedRoute;
