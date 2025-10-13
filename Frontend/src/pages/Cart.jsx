import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { updateQuantity, removeFromCart } from '../redux/cartSlice';

const Cart = () => {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.cart);

  // Calculate total quantity and price
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const total = items.reduce((acc, item) => acc + item.quantity * item.price, 0);

  const updateItemQuantity = (id, quantity) => {
    if (quantity < 1) {
      dispatch(removeFromCart(id));
    } else {
      dispatch(updateQuantity({ id, quantity }));
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white py-12 px-4 text-gray-900 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="container mx-auto max-w-4xl text-center"
        >
          <h1 className="text-3xl font-bold mb-4 text-indigo-900">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-6">Looks like you haven’t added any items yet.</p>
          <Link
            to="/products"
            className="bg-indigo-500 text-white py-2 px-6 rounded-xl hover:bg-indigo-600 transition duration-300"
          >
            Continue Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-white py-8 px-4 text-gray-900 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="container mx-auto max-w-4xl"
      >
        <h1 className="text-3xl font-bold mb-6 text-indigo-300">Shopping Cart</h1>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4 text-gray-600 font-semibold">Product</th>
                <th className="p-4 text-gray-600 font-semibold">Price</th>
                <th className="p-4 text-gray-600 font-semibold">Quantity</th>
                <th className="p-4 text-gray-600 font-semibold">Total</th>
                <th className="p-4 text-gray-600 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t hover:bg-gray-50 transition duration-200">
                  <td className="p-4 flex items-center space-x-4">
                    <img
                      src={item.image?.[0]?.url || item.image || '/placeholder.jpg'}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-xl"
                      onError={(e) => (e.target.src = '/placeholder.jpg')}
                    />
                    <span className="font-medium text-gray-800">{item.name}</span>
                  </td>
                  <td className="p-4 text-gray-700">${item.price.toFixed(2)}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="bg-gray-300 text-gray-800 px-2 py-1 rounded-xl disabled:opacity-50 hover:bg-gray-400 transition duration-200"
                      >
                        -
                      </motion.button>
                      <span className="px-3 text-gray-800">{item.quantity}</span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                        className="bg-gray-300 text-gray-800 px-2 py-1 rounded-xl hover:bg-gray-400 transition duration-200"
                      >
                        +
                      </motion.button>
                    </div>
                  </td>
                  <td className="p-4 text-gray-700">${(item.price * item.quantity).toFixed(2)}</td>
                  <td className="p-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => dispatch(removeFromCart(item.id))}
                      className="bg-red-500 text-white px-3 py-1 rounded-xl hover:bg-red-600 transition duration-200"
                    >
                      Remove
                    </motion.button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <Link to="/products" className="text-indigo-500 underline hover:text-indigo-600 transition duration-300">
            Continue Shopping
          </Link>
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-indigo-300">Total: ${total.toFixed(2)}</h2>
            <Link
              to="/checkout"
              className="bg-indigo-500 text-white py-2 px-6 rounded-xl hover:bg-indigo-600 transition duration-300"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Cart;
