import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

import products from "./routes/productRoutes.js";
import users from "./routes/userRoutes.js";
import admins from "./routes/adminRoutes.js";
import orders from "./routes/orderRoutes.js";
import errorHandleMiddleware from "./middleware/error.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === "development"
          ? "http://localhost:5173"
          : process.env.FRONTEND_URL,  // Deployed frontend
  credentials: true,               // allow cookies
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"], // for JWT header
};

app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.options("*", cors(corsOptions));

// Routes
app.use("/api/v1/products", products);
app.use("/api/v1/users", users);
app.use("/api/v1/admin", admins);
app.use("/api/v1/orders", orders);

// Error handling middleware
app.use(errorHandleMiddleware);

export default app;
