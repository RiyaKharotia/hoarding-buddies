
import { API_BASE_URL } from "@/utils/constants";
import axios from "axios";
import { toast } from "sonner";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // Adding a timeout to prevent long-hanging requests
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
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

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Don't show toast for canceled requests
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }
    
    const message = 
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";
    
    console.error("API Error:", error);
    toast.error(message);
    return Promise.reject(error);
  }
);

export default api;
