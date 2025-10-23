import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import products from "./routes/productRoutes.js";
import users from "./routes/userRoutes.js";
import admins from "./routes/adminRoutes.js";
import orders from "./routes/orderRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import errorHandleMiddleware from "./middleware/error.js";

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS configuration
const allowedOrigins = process.env.NODE_ENV === "development"
  ? ["http://localhost:5173"]
  : ["https://auraecom-fe.onrender.com"];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,             // allow cookies
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Routes
app.use("/api/v1/products", products);
app.use("/api/v1/users", users);
app.use("/api/v1/admin", admins);
app.use("/api/v1/orders", orders);
app.use("/api/v1/cart", cartRoutes);

// Error handling middleware
app.use(errorHandleMiddleware);

export default app;
