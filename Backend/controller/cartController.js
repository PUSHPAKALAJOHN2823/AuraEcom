import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";
import HandleError from "../utils/handleError.js";
import handleAsynError from "../middleware/handleAsynError.js";

// 🛒 Get current user's cart
export const getCart = handleAsynError(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart) {
    return res.status(200).json({ success: true, cart: { items: [], total: 0 } });
  }
  res.status(200).json({ success: true, cart });
});

// ➕ Add item to cart
export const addToCart = handleAsynError(async (req, res, next) => {
  const { productId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product) return next(new HandleError("Product not found", 404));

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [], total: 0 });

  const existing = cart.items.find((i) => i.product.toString() === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({
      product: product._id,
      name: product.name,
      price: product.price,
      image: product.image[0]?.url,
      quantity,
    });
  }

  cart.total = cart.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  await cart.save();

  res.status(200).json({ success: true, cart });
});

// 🗑 Remove item from cart
export const removeFromCart = handleAsynError(async (req, res, next) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new HandleError("Cart not found", 404));

  cart.items = cart.items.filter((i) => i.product.toString() !== productId);
  cart.total = cart.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  await cart.save();

  res.status(200).json({ success: true, cart });
});

// 🔄 Update item quantity
export const updateQuantity = handleAsynError(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new HandleError("Cart not found", 404));

  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) return next(new HandleError("Item not found in cart", 404));

  item.quantity = quantity;
  cart.total = cart.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  await cart.save();

  res.status(200).json({ success: true, cart });
});

// ❌ Clear cart
export const clearCart = handleAsynError(async (req, res, next) => {
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { items: [], total: 0 },
    { new: true }
  );
  res.status(200).json({ success: true, message: "Cart cleared" });
});
