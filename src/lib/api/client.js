import axios from 'axios';

// Create an axios instance with base settings
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Create an axios instance for multipart form data
export const apiMultipart = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'multipart/form-data',
  },
  timeout: 30000, // 30 seconds
});

// Add a request interceptor to include authorization token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Apply the same interceptor to multipart requests
apiMultipart.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle session timeouts or unauthorized access
    if (error.response && error.response.status === 401) {
      console.log('Unauthorized access or session expired');
      // Clear local storage and redirect to login if needed
      localStorage.removeItem('token');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Apply the same response interceptor to multipart requests
apiMultipart.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log('Unauthorized access or session expired');
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;