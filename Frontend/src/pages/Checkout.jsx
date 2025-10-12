import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { removeFromCart, updateQuantity, clearCart } from "../redux/cartSlice";

const Checkout = () => {
  const { items, total } = useSelector((state) => state.cart);
  const { token, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  const [paymentMethod, setPaymentMethod] = useState("Razorpay");
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const loaded = await loadRazorpay();
    if (!loaded) {
      return alert("Razorpay SDK failed to load");
    }

    setLoading(true);
    setPaymentError(null);

    try {
      console.log("🟩 Sending order creation request...");

      const { data } = await api.post(
        "/orders",
        {
          orderItems: items.map((item) => ({
            product: item._id,
            name: item.name,
            qty: item.quantity,
            image: item.image[0]?.url || "/placeholder.jpg",
            price: item.price,
          })),
          shippingAddress: {
            address: shippingAddress.address,
            city: shippingAddress.city,
            postalCode: shippingAddress.postalCode,
            country: shippingAddress.country,
          },
          paymentMethod,
          itemsPrice: total,
          taxPrice: 0,
          shippingPrice: 0,
          totalPrice: total,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("✅ Order created:", data);

      const razorpayKey = "rzp_test_RQEYzWx6ZaLAaY";
      const orderId = data.razorpayOrderId;

      if (!orderId) {
        console.error("❌ Razorpay Order ID missing in response:", data);
        alert("Failed to initialize Razorpay payment.");
        return;
      }

      const options = {
        key: razorpayKey,
        amount: data.order.totalPrice * 100,
        currency: "INR",
        name: "Fress Collection",
        description: "Order Payment",
        order_id: orderId,
        handler: async (response) => {
          console.log("🟢 Razorpay payment successful:", response);
          try {
            const verifyRes = await api.put(
              `/orders/${data.order._id}/pay`,
              {
                paymentId: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            console.log("Payment verification response:", verifyRes.data);
            if (verifyRes.data.success) {
              dispatch(clearCart());
              alert("Payment Successful!");
              navigate("/order/success", { state: { orderId: data.order._id } });
            } else {
              alert(
                `Payment verification failed: ${
                  verifyRes.data.message || "Unknown error"
                }`
              );
            }
          } catch (err) {
            console.error(
              "Payment verification error:",
              err.response?.data || err.message
            );
            setPaymentError(
              `Payment verification failed: ${
                err.response?.data?.message || err.message
              }`
            );
          }
        },
        prefill: {
          name: user?.name || "Guest",
          email: user?.email || "guest@example.com",
        },
        theme: { color: "#4CAF50" },
      };

      console.log("🧾 Razorpay options:", options);

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (err) {
      console.error("❌ Error creating order:", err);
      setPaymentError(err.response?.data?.message || "Error creating order");
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const isAddressValid = Object.values(shippingAddress).every(
    (value) => value.trim() !== ""
  );

  return (
    <div className="container mx-auto py-8 px-4 md:px-8 max-w-4xl">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">
        Secure Checkout
      </h1>
      {items.length === 0 ? (
        <div className="bg-white shadow-lg rounded-lg p-6 text-center">
          <p className="text-xl text-gray-600 mb-4">
            Your cart is empty.{" "}
            <a href="/products" className="text-blue-600 underline hover:text-blue-800">
              Continue Shopping
            </a>
          </p>
        </div>
      ) : (
        <>
          {/* Progress Indicator */}
          <div className="mb-8 flex justify-between text-sm text-gray-500">
            <span className="flex items-center">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center mr-2">1</span>
              Cart
            </span>
            <span className="flex items-center">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center mr-2">2</span>
              Shipping
            </span>
            <span className="flex items-center">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center mr-2">3</span>
              Payment
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cart Summary */}
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-2">
                Order Summary
              </h2>
              {items.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center mb-6 border-b pb-4 last:border-b-0"
                >
                  <img
                    src={item.image[0]?.url || "/placeholder.jpg"}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-md mr-4"
                    onError={(e) => { e.target.src = "/placeholder.jpg"; }} // Fallback image
                  />
                  <div className="flex-grow">
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-gray-600">
                      ${item.price.toFixed(2)} x {item.quantity}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        dispatch(
                          updateQuantity({
                            id: item._id,
                            quantity: item.quantity + 1,
                          })
                        )
                      }
                      className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition"
                    >
                      +
                    </button>
                    <button
                      onClick={() =>
                        item.quantity > 1
                          ? dispatch(
                              updateQuantity({
                                id: item._id,
                                quantity: item.quantity - 1,
                              })
                            )
                          : dispatch(removeFromCart(item._id))
                      }
                      className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition"
                    >
                      -
                    </button>
                    <button
                      onClick={() => dispatch(removeFromCart(item._id))}
                      className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <div className="mt-6 pt-4 border-t">
                <p className="text-xl font-bold text-gray-900">
                  Total: ${total.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Shipping & Payment */}
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-2">
                Shipping & Payment
              </h2>

              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4 text-gray-700">Shipping Address</h3>
                <input
                  type="text"
                  name="address"
                  placeholder="Street Address"
                  value={shippingAddress.address}
                  onChange={handleAddressChange}
                  className="w-full p-3 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={shippingAddress.city}
                  onChange={handleAddressChange}
                  className="w-full p-3 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
                <input
                  type="text"
                  name="state"
                  placeholder="State / Province"
                  value={shippingAddress.state}
                  onChange={handleAddressChange}
                  className="w-full p-3 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
                <input
                  type="text"
                  name="postalCode"
                  placeholder="ZIP / Postal Code"
                  value={shippingAddress.postalCode}
                  onChange={handleAddressChange}
                  className="w-full p-3 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
                <input
                  type="text"
                  name="country"
                  placeholder="Country"
                  value={shippingAddress.country}
                  onChange={handleAddressChange}
                  className="w-full p-3 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4 text-gray-700">Payment Method</h3>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="Razorpay">Razorpay</option>
                </select>
              </div>

              <button
                onClick={handlePayment}
                disabled={!isAddressValid || loading || items.length === 0}
                className={`w-full py-3 rounded-lg text-white font-semibold ${
                  loading || !isAddressValid
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 transition"
                }`}
              >
                {loading ? "Processing..." : "Pay Now"}
              </button>
              {paymentError && (
                <p className="mt-4 text-red-500 text-center">{paymentError}</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Checkout;