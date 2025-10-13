import axios from 'axios';

// Create Axios instance with VITE_API_URL from environment
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Vite environment variable
  withCredentials: true, // allows cookies to be sent
});

// Attach Authorization header if token exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Token being sent:', token); // Debugging
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
