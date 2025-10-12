import express from "express";
import {
  getAllProducts,
  getSingleProduct,
  createProducts,
  updateProduct,
  deleteProduct,
  createProductReview
} from "../controller/productController.js";

import { verifyUserAuth, roleBasedAccess } from "../middleware/userAuth.js";

const router = express.Router();

// -------------------- PUBLIC ROUTES --------------------
// All users (including admins) can view products
router.route("/products").get(getAllProducts);
router.route("/product/:id").get(getSingleProduct);

// Logged-in users can post reviews
router.route("/product/:id/reviews").post(verifyUserAuth, createProductReview);

// -------------------- ADMIN ROUTES --------------------
router
  .route("/admin/product/create")
  .post(verifyUserAuth, roleBasedAccess("admin"), createProducts);

router
  .route("/admin/product/:id")
  .put(verifyUserAuth, roleBasedAccess("admin"), updateProduct)
  .delete(verifyUserAuth, roleBasedAccess("admin"), deleteProduct);

export default router;
