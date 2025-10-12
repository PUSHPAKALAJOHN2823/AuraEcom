import Order from '../models/orderModel.js';
import handleAsynError from '../middleware/handleAsynError.js';
import HandleError from '../utils/handleError.js';
import { razorpay } from '../utils/razorpay.js';
import { createHmac } from 'crypto'; // ES module import for crypto

export const addOrderItems = handleAsynError(async (req, res, next) => {
  console.log('Starting order creation process');
  console.log('Request body:', req.body);
  console.log('User from token:', req.user);

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
    console.log('Validation failed: No order items');
    return next(new HandleError('No order items', 400));
  }

  if (!totalPrice || totalPrice <= 0) {
    console.log('Validation failed: Invalid total price:', totalPrice);
    return next(new HandleError('Invalid total price', 400));
  }

  try {
    console.log('Validating Razorpay instance');
    if (!razorpay || typeof razorpay.orders.create !== 'function') {
      throw new Error('Razorpay instance is not properly initialized');
    }

    console.log('Creating Razorpay order with amount:', Math.round(totalPrice * 100));
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalPrice * 100),
      currency: 'INR',
      receipt: `order_rcptid_${Date.now()}`,
      notes: {
        userId: req.user.id,
        orderItems: orderItems.map(item => item.product),
      },
    });
    console.log('Razorpay order created successfully:', razorpayOrder);

    console.log('Creating order document');
    const order = new Order({
      orderItems,
      user: req.user.id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      razorpayOrderId: razorpayOrder.id,
    });

    console.log('Saving order to database');
    const createdOrder = await order.save();
    console.log('Order saved successfully:', createdOrder);

    res.status(201).json({
      success: true,
      order: createdOrder,
      razorpayOrderId: razorpayOrder.id, // Added to ensure frontend gets this
    });
  } catch (error) {
    console.error('Detailed error in addOrderItems:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });
    return next(new HandleError(`Failed to create order: ${error.message}`, 500));
  }
});

export const getOrderById = handleAsynError(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) {
    return next(new HandleError('Order not found', 404));
  }
  res.status(200).json({
    success: true,
    order,
  });
});

export const updateOrderToPaid = handleAsynError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new HandleError('Order not found', 404));
  }

  const { paymentId, razorpay_order_id, razorpay_signature } = req.body;

  if (!paymentId) {
    return next(new HandleError('Payment verification failed: `payment_id` is mandatory', 400));
  }

  try {
    console.log('Fetching payment details for paymentId:', paymentId);
    const payment = await razorpay.payments.fetch(paymentId);
    console.log('Payment details fetched:', payment);

    if (payment.status === 'captured') {
      // Correct signature verification as per Razorpay documentation
      const key = 'WBJYRq2r4TmhPRhrAiYgMi05'; // Your Razorpay key_secret
      const expectedSignature = createHmac('sha256', key)
        .update(`${razorpay_order_id}|${paymentId}`)
        .digest('hex');

      console.log('Expected Signature:', expectedSignature);
      console.log('Received Signature:', razorpay_signature);

      if (expectedSignature === razorpay_signature) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
          id: payment.id,
          status: payment.status,
          update_time: payment.created_at,
          email_address: req.user.email,
        };
        const updatedOrder = await order.save();
        console.log('Order updated to paid:', updatedOrder);

        res.status(200).json({
          success: true,
          order: updatedOrder,
        });
      } else {
        return next(new HandleError('Payment signature verification failed', 400));
      }
    } else {
      return next(new HandleError('Payment not captured', 400));
    }
  } catch (error) {
    console.error('Error in payment verification:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });
    return next(new HandleError(`Payment verification failed: ${error.message}`, 500));
  }
});

export const updateOrderToDelivered = handleAsynError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new HandleError('Order not found', 404));
  }
  order.isDelivered = true;
  order.deliveredAt = Date.now();
  const updatedOrder = await order.save();
  res.status(200).json({
    success: true,
    order: updatedOrder,
  });
});

export const getMyOrders = handleAsynError(async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id });
  res.status(200).json({
    success: true,
    orders,
  });
});

export const getAllOrders = handleAsynError(async (req, res, next) => {
  const orders = await Order.find().populate('user', 'id name');
  let totalAmount = 0;
  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });
  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

export const checkProductPurchase = handleAsynError(async (req, res, next) => {
  const productId = req.params.productId;
  const userId = req.user.id;

  const orders = await Order.find({ user: userId, isPaid: true }).populate('orderItems.product');
  const hasPurchased = orders.some((order) =>
    order.orderItems.some((item) => item.product._id.toString() === productId)
  );

  res.status(200).json({
    success: true,
    hasPurchased,
  });
});

export default { 
  addOrderItems, 
  getOrderById, 
  updateOrderToPaid, 
  updateOrderToDelivered, 
  getMyOrders, 
  getAllOrders, 
  checkProductPurchase 
};