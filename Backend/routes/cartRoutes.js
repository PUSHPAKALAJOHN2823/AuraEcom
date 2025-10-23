import express from "express";
import {
  getCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
} from "../controller/cartController.js";
import { verifyUserAuth } from "../middleware/userAuth.js";

const router = express.Router();

router.get("/", verifyUserAuth, getCart);
router.post("/", verifyUserAuth, addToCart);
router.put("/", verifyUserAuth, updateQuantity);
router.delete("/:productId", verifyUserAuth, removeFromCart);
router.delete("/", verifyUserAuth, clearCart);

export default router;
