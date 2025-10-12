import Product from "../models/productModel.js";
import HandleError from "../utils/handleError.js";
import handleAsynError from "../middleware/handleAsynError.js";
import APIFunctionality from "../utils/apiFunctionality.js";

// -------------------- CREATE PRODUCT --------------------
export const createProducts = handleAsynError(async (req, res, next) => {
  if (!req.body.image || !Array.isArray(req.body.image) || req.body.image.length === 0) {
    return next(new HandleError("Image array is required", 400));
  }

  req.body.user = req.user._id;

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    product,
  });
});

// -------------------- GET ALL PRODUCTS (PUBLIC) --------------------
export const getAllProducts = handleAsynError(async (req, res, next) => {
  const resultPerPage = 12;

  const apiFeatures = new APIFunctionality(Product.find(), req.query)
    .search()
    .filter()
    .sort();

  // Get total count before pagination
  const totalCount = await apiFeatures.getTotalCount();
  const totalPages = Math.ceil(totalCount / resultPerPage);
  const page = Number(req.query.page) || 1;

  if (page > totalPages && totalCount > 0) {
    return next(new HandleError("This page doesn't exist", 404));
  }

  // Apply pagination after counting
  apiFeatures.pagination(resultPerPage);

  const products = await apiFeatures.query.select(
    "name price image category stock color material type"
  );

  if (!products || products.length === 0) {
    return next(new HandleError("No Products Found", 404));
  }

  // For similar products, adjust response if notId is present
  if (req.query.notId) {
    res.status(200).json({
      success: true,
      products: products.filter((p) => p._id.toString() !== req.query.notId),
      productCount: products.length,
      totalPages,
      currentPage: page,
    });
  } else {
    res.status(200).json({
      success: true,
      products,
      productCount: totalCount, // Use totalCount instead of products.length
      resultPerPage,
      totalPages,
      currentPage: page,
    });
  }
});

// -------------------- GET SINGLE PRODUCT (PUBLIC) --------------------
export const getSingleProduct = handleAsynError(async (req, res, next) => {
  const product = await Product.findById(req.params.id).select(
    "name price image description category stock color material type"
  );
  if (!product) {
    return next(new HandleError("Product Not Found", 404));
  }
  res.status(200).json({
    success: true,
    product,
  });
});

// -------------------- UPDATE PRODUCT (ADMIN) --------------------
export const updateProduct = handleAsynError(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).select("name price image category stock color material type");

  if (!product) {
    return next(new HandleError("Product Not Found", 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

// -------------------- DELETE PRODUCT (ADMIN) --------------------
export const deleteProduct = handleAsynError(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return next(new HandleError("Product Not Found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Product Deleted Successfully",
  });
});

// -------------------- GET ALL PRODUCTS (ADMIN) --------------------
export const getAdminProducts = handleAsynError(async (req, res, next) => {
  const products = await Product.find().select(
    "name price image category stock color material type"
  );
  res.status(200).json({
    success: true,
    products,
  });
});

export const createProductReview = handleAsynError(async (req, res, next) => {
  const { rating, comment } = req.body;
  const productId = req.params.id;
  const userId = req.user._id;

  const product = await Product.findById(productId);
  if (!product) {
    return next(new HandleError("Product not found", 404));
  }

  const alreadyReviewed = product.reviews.find((r) => r.user.toString() === userId.toString());
  if (alreadyReviewed) {
    return next(new HandleError("Product already reviewed", 400));
  }

  const review = {
    name: req.user.name,
    rating: Number(rating),
    comment,
    user: userId,
  };

  product.reviews.push(review);
  product.numberOfReviews = product.reviews.length;
  product.ratings =
    product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    review,
  });
});

export default {
  createProducts,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getAdminProducts,
  createProductReview,
};