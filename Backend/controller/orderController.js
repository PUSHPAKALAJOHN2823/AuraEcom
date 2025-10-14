import Order from "../models/orderModel.js";
import handleAsynError from "../middleware/handleAsynError.js";
import HandleError from "../utils/handleError.js";
import { razorpay } from "../utils/razorpay.js";
import { createHmac } from "crypto"; // Node’s crypto module

// 🧾 Add new order
export const addOrderItems = handleAsynError(async (req, res, next) => {
  console.log("Creating new order for user:", req.user?._id);
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return next(new HandleError("No order items provided", 400));
  }

  if (!totalPrice || totalPrice <= 0) {
    return next(new HandleError("Invalid total price", 400));
  }

  // ✅ Create Razorpay order
  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(totalPrice * 100),
    currency: "INR",
    receipt: `order_rcptid_${Date.now()}`,
    notes: {
      userId: req.user._id.toString(),
    },
  });

  // ✅ Create order document in MongoDB
  const order = await Order.create({
    orderItems,
    user: req.user._id, // linked to the logged-in user only
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    razorpayOrderId: razorpayOrder.id,
  });

  res.status(201).json({
    success: true,
    order,
    razorpayOrderId: razorpayOrder.id,
  });
});

// 📦 Get logged-in user’s orders
export const getMyOrders = handleAsynError(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    orders,
  });
});

// 🔍 Get specific order (user can see only their own)
export const getOrderById = handleAsynError(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");

  if (!order) {
    return next(new HandleError("Order not found", 404));
  }

  // ✅ Prevent other users from viewing this order
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return next(new HandleError("Not authorized to view this order", 403));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// 💳 Mark order as paid
export const updateOrderToPaid = handleAsynError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new HandleError("Order not found", 404));
  }

  const { paymentId, razorpay_order_id, razorpay_signature } = req.body;

  if (!paymentId) {
    return next(new HandleError("Payment verification failed: payment_id missing", 400));
  }

  try {
    const payment = await razorpay.payments.fetch(paymentId);
    if (payment.status !== "captured") {
      return next(new HandleError("Payment not captured", 400));
    }

    // Verify Razorpay signature
    const expectedSignature = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${paymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return next(new HandleError("Invalid payment signature", 400));
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: payment.id,
      status: payment.status,
      update_time: payment.created_at,
      email_address: req.user.email,
    };

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return next(new HandleError("Payment verification failed", 500));
  }
});

// 🚚 Mark order as delivered (admin only)
export const updateOrderToDelivered = handleAsynError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new HandleError("Order not found", 404));
  }

  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({
    success: true,
    order: updatedOrder,
  });
});

// 🧑‍💼 Get all orders (admin)
export const getAllOrders = handleAsynError(async (req, res, next) => {
  const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });

  const totalAmount = orders.reduce((acc, order) => acc + order.totalPrice, 0);

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

// ✅ Check if a user purchased a product
export const checkProductPurchase = handleAsynError(async (req, res, next) => {
  const productId = req.params.productId;
  const userId = req.user._id;

  const orders = await Order.find({ user: userId, isPaid: true }).populate("orderItems.product");
  const hasPurchased = orders.some((order) =>
    order.orderItems.some((item) => item.product._id.toString() === productId)
  );

  res.status(200).json({
    success: true,
    hasPurchased,
  });
});
