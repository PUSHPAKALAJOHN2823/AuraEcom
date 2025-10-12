import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { motion } from 'framer-motion';

const MyOrders = () => {
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !token) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/myorders'); // ✅ backend route
        setOrders(data.orders || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, token, navigate]);

  const markAsDelivered = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}/deliver`);
      // Re-fetch updated order list
      const { data } = await api.get('/orders/myorders');
      setOrders(data.orders || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark as delivered');
    }
  };

  if (loading) return <div className="text-center py-8 text-gray-600">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (orders.length === 0) return <div className="text-center py-8 text-gray-600">No orders found.</div>;

  return (
    <div className="bg-white py-8 px-4 text-gray-900 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="container mx-auto max-w-4xl"
      >
        <h1 className="text-3xl font-bold mb-6 text-indigo-900">My Orders</h1>
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          {orders.map((order) => (
            <div key={order._id} className="border-b last:border-b-0 p-4 hover:bg-gray-50">
              <div className="flex justify-between items-center flex-wrap">
                <div>
                  <p className="text-lg font-semibold text-gray-700">Order #{order._id.slice(-8)}</p>
                  <p className="text-sm text-gray-500">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-500">Total: ₹{order.totalPrice.toFixed(2)}</p>
                  <p
                    className={`text-sm font-medium ${
                      order.isDelivered ? 'text-green-600' : 'text-yellow-600'
                    }`}
                  >
                    Status: {order.isDelivered ? 'Delivered' : 'Pending'}
                  </p>
                </div>

                <div className="flex items-center gap-4 mt-2 sm:mt-0">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/order/${order._id}`)}
                    className="text-indigo-500 hover:underline"
                  >
                    View Details
                  </motion.button>

                  {/* Admin-only button */}
                  {user.role === 'admin' && !order.isDelivered && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => markAsDelivered(order._id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-md text-sm"
                    >
                      Mark Delivered
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default MyOrders;
