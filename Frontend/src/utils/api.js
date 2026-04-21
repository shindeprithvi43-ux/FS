import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://fs-q9bp.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add JWT token to every request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('kca_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect on 401 from the login endpoint itself — let the
    // AuthContext handle that and show a proper error toast instead.
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('kca_token');
      localStorage.removeItem('kca_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
