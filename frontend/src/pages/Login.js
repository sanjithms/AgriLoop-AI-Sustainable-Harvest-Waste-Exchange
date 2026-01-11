import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  // Redirect to OTP login page
  useEffect(() => {
    navigate("/otp-login");
  }, [navigate]);

  return (
    <div className="container mt-5">
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Redirecting to secure login...</p>
      </div>
    </div>
  );
};

export default Login;
