import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { setCredentials, setLoading } from '../redux/authSlice';
import { setCart } from '../redux/cartSlice';
import api from '../utils/api';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));

    try {
      // 1️⃣ Login API
      const res = await api.post('/users/login', form);
      const token = res.data.token || res.data.data?.token;
      const userData = res.data.user || res.data.data?.user;

      if (!token || !userData) throw new Error('Invalid server response');

      // 2️⃣ Save token locally
      localStorage.setItem('token', token);

      // 3️⃣ Update auth state
      dispatch(setCredentials({ user: userData, token }));

      // 4️⃣ Fetch backend cart
      const cartRes = await api.get('/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      let backendCart = cartRes.data.cart || { items: [], total: 0 };

      // 5️⃣ Merge guest cart if exists
      const guestCart = JSON.parse(localStorage.getItem('cart_guest') || '{"items":[],"total":0}');
      if (guestCart.items.length > 0) {
        guestCart.items.forEach((item) => {
          const existing = backendCart.items.find(
            (i) => (i.product?._id || i.id) === item.id
          );
          if (existing) {
            existing.quantity += item.quantity;
          } else {
            backendCart.items.push({
              product: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
            });
          }
        });

        // Recalculate total
        backendCart.total = backendCart.items.reduce(
          (acc, i) => acc + i.price * i.quantity,
          0
        );

        // Save merged cart to backend
        await api.post(
          '/cart',
          { items: backendCart.items },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Clear guest cart
        localStorage.removeItem('cart_guest');
      }

      // 6️⃣ Set cart in Redux
      dispatch(setCart(backendCart));

      // 7️⃣ Success toast & redirect
      toast.success('Login successful! Redirecting...', { position: 'top-right', autoClose: 1500 });
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      console.error('Login Error:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Login failed';
      toast.error(errorMessage, { position: 'top-right', autoClose: 3000 });
    } finally {
      dispatch(setLoading(false));
    }
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
        {/* Left Side */}
        <div className="hidden lg:block w-1/2 p-10 bg-[linear-gradient(135deg,_#1e3a8a_0%,_#7c3aed_100%)] text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-mosaic.png')] opacity-10"></div>
          <h2 className="text-4xl font-bold mb-6 tracking-tight">Welcome Back</h2>
          <p className="text-lg leading-relaxed opacity-90">
            Sign in to unlock exclusive collections and seamless shopping experiences.
          </p>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 p-8 sm:p-10 space-y-8">
          <h1 className="text-3xl font-bold text-white text-center">Sign In</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.4 }}>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email</label>
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
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.4 }}>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
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
              className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-xl hover:from-purple-600 hover:to-indigo-600 transition duration-300 font-semibold text-lg shadow-lg ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </motion.button>
          </form>
          <div className="text-center space-y-3">
            <p className="text-gray-400 text-sm">
              Not a member?{' '}
              <Link to="/register" className="text-indigo-400 hover:text-indigo-300 transition duration-200">Create an account</Link>
            </p>
            <p className="text-gray-400 text-sm">
              <Link to="/forgot-password" className="text-indigo-400 hover:text-indigo-300 transition duration-200">Forgot Password?</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
