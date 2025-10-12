import HandleError from "../utils/handleError.js";
import handleAsynError from "./handleAsynError.js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const verifyUserAuth = handleAsynError(async (req, res, next) => {
  let token;
  // Check cookies
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
    console.log('Token from cookies:', token);
  }
  // Check Authorization header
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
      console.log('Token from header:', token);
    }
  }

  if (!token) {
    return next(
      new HandleError(
        "Authentication is missing!, please login to access resource",
        401
      )
    );
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);
  console.log('Decoded data:', decodedData);
  req.user = await User.findById(decodedData.id);
  next();
});

export const roleBasedAccess = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new HandleError(`Role - ${req.user.role} is not allowed to access the resource`, 403));
    }
    next();
  };
};