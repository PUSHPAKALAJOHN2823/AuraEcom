import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // https://auraecom-be.onrender.com/api/v1
  withCredentials: true,                  // send cookies cross-origin
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // optional fallback
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
