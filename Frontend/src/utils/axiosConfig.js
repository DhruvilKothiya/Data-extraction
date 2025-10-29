import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to attach token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle authentication errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const handleUnauthorized = () => {
      // Clear all authentication data
      localStorage.removeItem("token");
      localStorage.removeItem("User");
      localStorage.removeItem("companySearchTerm");
      localStorage.removeItem("companyCurrentPage");
      // Redirect to signin page
      window.location.href = "/signin";
    };

    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      handleUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
