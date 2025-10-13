import jwt from "jsonwebtoken";

export const sendToken = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });

  // Cookie options
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // must be true for HTTPS
    sameSite: "none",                               // allows cross-site cookie
    maxAge: 2 * 24 * 60 * 60 * 1000,                // 2 days
  };

  res.status(statusCode)
     .cookie("token", token, options)
     .json({
        success: true,
        token, // optional: for localStorage fallback
        user,
     });
};
