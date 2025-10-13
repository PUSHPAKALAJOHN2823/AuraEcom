import axios from 'axios';

const api = axios.create({
  baseURL: 'https://auraecom-be.onrender.com/api/v1',
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Token being sent:', token); // Debug token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;