import jwt from "jsonwebtoken";

export const sendToken = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none", // required for cross-site cookie (frontend <-> backend)
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  // ✅ Send cookie + user (no need to store token in localStorage)
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
  });
};
