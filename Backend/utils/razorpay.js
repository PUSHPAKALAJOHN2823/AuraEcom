import Razorpay from 'razorpay';

export const razorpay = new Razorpay({
  key_id: "rzp_test_RQEYzWx6ZaLAaY",
  key_secret: "WBJYRq2r4TmhPRhrAiYgMi05"
});

razorpay.orders.create({
  amount: 10000,
  currency: 'INR',
  receipt: 'test_receipt',
}, (err, order) => {
  console.log('Razorpay test:', err || order);
});