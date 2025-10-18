import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { setCredentials, setLoading } from '../redux/authSlice';
import api from '../utils/api';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));
    
    try {
      const res = await api.post('/users/login', form);
      console.log('Login Response:', res.data); // Debug log
      
      // Handle different possible response structures
      const token = res.data.token || res.data.data?.token;
      const user = res.data.user || res.data.data?.user;
      
      if (token && user) {
        // Store token first
        localStorage.setItem('token', token);
        
        // Update Redux state
        dispatch(setCredentials({ user, token }));
        
        // Show success message
        toast.success('Login successful! Redirecting...', {
          position: 'top-right',
          autoClose: 1500,
        });
        
        // Navigate after toast
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        throw new Error('Invalid server response');
      }
    } catch (err) {
      console.error('Login Error:', err); // Debug log
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Login failed. Please try again.';
      
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 sm:p-6 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black">
      <ToastContainer theme="dark" />
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-2xl flex w-full max-w-5xl overflow-hidden border border-gray-700/50"
      >
        {/* Left Side - Branding */}
        <div className="hidden lg:block w-1/2 p-10 bg-[linear-gradient(135deg,_#1e3a8a_0%,_#7c3aed_100%)] text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-mosaic.png')] opacity-10"></div>
          <h2 className="text-4xl font-bold mb-6 tracking-tight">Welcome Back</h2>
          <p className="text-lg leading-relaxed opacity-90">
            Sign in to unlock a world of exclusive collections and seamless shopping experiences.
          </p>
          <div className="mt-8">
            <p className="text-sm opacity-70">Trusted by thousands of users worldwide.</p>
          </div>
        </div>
        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 p-8 sm:p-10 space-y-8">
          <h1 className="text-3xl font-bold text-white text-center">Sign In</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                className="w-full p-4 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-gray-400 transition duration-300"
                disabled={isLoading}
                required
              />
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                className="w-full p-4 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-gray-400 transition duration-300"
                disabled={isLoading}
                required
              />
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-xl hover:from-purple-600 hover:to-indigo-600 transition duration-300 font-semibold text-lg shadow-lg ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </motion.button>
          </form>
          <div className="text-center space-y-3">
            <p className="text-gray-400 text-sm">
              Not a member?{' '}
              <Link to="/register" className="text-indigo-400 hover:text-indigo-300 transition duration-200">
                Create an account
              </Link>
            </p>
            <p className="text-gray-400 text-sm">
              <Link to="/forgot-password" className="text-indigo-400 hover:text-indigo-300 transition duration-200">
                Forgot Password?
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;