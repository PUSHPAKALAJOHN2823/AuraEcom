import HandleError from "../utils/handleError.js";
import handleAsynError from "./handleAsynError.js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const verifyUserAuth = handleAsynError(async (req, res, next) => {
  let token;

  // 1️⃣ Check cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
    console.log("Token from cookies:", token);
  }

  // 2️⃣ Check Authorization header
  if (!token && req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    console.log("Token from Authorization header:", token);
  }

  // 3️⃣ No token found
  if (!token) {
    return next(
      new HandleError(
        "Authentication missing! Please log in to access this resource.",
        401
      )
    );
  }

  // 4️⃣ Decode and verify
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next(new HandleError("User not found!", 404));
    }

    req.user = user; // ✅ attach user to request
    console.log("Authenticated user:", user.email);
    next();
  } catch (err) {
    return next(new HandleError("Invalid or expired token", 401));
  }
});

export const roleBasedAccess = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(
      new HandleError(
        `Role '${req.user.role}' is not allowed to access this resource`,
        403
      )
    );
  }
  next();
};
