import jwt from "jsonwebtoken";

export const sendToken = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // must be true for sameSite='none'
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,  // include token for frontend usage
    user,
  });
};
