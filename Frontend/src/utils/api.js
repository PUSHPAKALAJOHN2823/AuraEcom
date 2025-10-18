import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // e.g., /api/v1 (local) or deployed URL
  withCredentials: true,                  // send cookies cross-origin
});

// Add token automatically from localStorage (optional)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); 
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
