import axios from "axios";

// Create a custom axios instance with retry capability
const createAxiosInstanceWithRetry = (baseURL, maxRetries = 3, retryDelay = 1000) => {
  const instance = axios.create({
    baseURL: baseURL,
    timeout: 10000, // 10 seconds timeout
    headers: {
      'Accept': 'application/json'
    },
    withCredentials: false // Set to true if using cookies for authentication
  });

  // Add retry logiccd
  instance.interceptors.response.use(null, async (error) => {
    const { config } = error;
    
    // Only retry on network errors or 5xx server errors
    if (!config || !error.response || error.response.status < 500) {
      return Promise.reject(error);
    }
    
    // Set retry count
    config.__retryCount = config.__retryCount || 0;
    
    // Check if we've maxed out the total number of retries
    if (config.__retryCount >= maxRetries) {
      // Reject with the error
      return Promise.reject(error);
    }
    
    // Increase the retry count
    config.__retryCount += 1;
    
    console.log(`Retrying request (${config.__retryCount}/${maxRetries}): ${config.url}`);
    
    // Create new promise to handle retry delay
    const backoff = new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Retry after ${retryDelay}ms delay`);
        resolve();
      }, retryDelay);
    });
    
    // Wait for the backoff then retry
    await backoff;
    return instance(config);
  });
  
  return instance;
};

const instance = createAxiosInstanceWithRetry(
  process.env.REACT_APP_API_URL || "http://localhost:5002/api"
);

// Add a request interceptor to include session token
instance.interceptors.request.use(
  (config) => {
    // Check for sessionToken first (OTP auth)
    const sessionToken = localStorage.getItem("sessionToken");
    if (sessionToken) {
      config.headers.Authorization = `Bearer ${sessionToken}`;
      return config;
    }
    
    // If no sessionToken, check for regular token
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", error);

    // Handle session expiration
    if (error.response && error.response.status === 401) {
      console.log("401 Unauthorized error detected");

      // Check if user was using sessionToken (OTP auth)
      if (localStorage.getItem('sessionToken')) {
        console.log("Clearing OTP auth data and redirecting to login");

        // Clear all auth-related data
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        localStorage.removeItem('name');
        localStorage.removeItem('email');

        // Show alert before redirect (only if not already on login page)
        if (!window.location.pathname.includes('/login')) {
          alert('Your session has expired. Please login again with OTP verification.');

          // Redirect to login page
          window.location.href = '/login';
        }

        return Promise.reject(new Error('Your session has expired. Please login again with OTP verification.'));
      }
      
      // Check if user was using regular token
      else if (localStorage.getItem('token')) {
        console.log("Clearing regular auth data and redirecting to login");
        
        // Clear all auth-related data
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        localStorage.removeItem('name');
        localStorage.removeItem('email');
        
        // Show alert before redirect (only if not already on login page)
        if (!window.location.pathname.includes('/login')) {
          alert('Your session has expired. Please login again.');
          
          // Redirect to login page
          window.location.href = '/login';
        }
        
        return Promise.reject(new Error('Your session has expired. Please login again.'));
      }
    }

    // Handle server errors
    if (error.response && error.response.status >= 500) {
      console.log("Server error detected");
      // You could add global error handling for server errors here
    }

    return Promise.reject(error);
  }
);

export default instance;
