import express from "express";
import {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getAllOrders,
  checkProductPurchase,
} from "../controller/orderController.js";
import { verifyUserAuth, roleBasedAccess } from "../middleware/userAuth.js";

const router = express.Router();

// ✅ Create order (user only)
router.route("/")
  .post(verifyUserAuth, addOrderItems);

// ✅ Get logged-in user's orders
router.route("/myorders")
  .get(verifyUserAuth, getMyOrders);

// ✅ Admin: Get all orders
router.route("/admin")
  .get(verifyUserAuth, roleBasedAccess("admin"), getAllOrders);

// ✅ Get order by ID (only owner or admin)
router.route("/:id")
  .get(verifyUserAuth, getOrderById);

// ✅ Mark order as paid (user)
router.route("/:id/pay")
  .put(verifyUserAuth, updateOrderToPaid);

// ✅ Mark order as delivered (admin only)
router.route("/:id/deliver")
  .put(verifyUserAuth, roleBasedAccess("admin"), updateOrderToDelivered);

// ✅ Check if user purchased a specific product
router.route("/:productId/check-purchase")
  .get(verifyUserAuth, checkProductPurchase);

export default router;
