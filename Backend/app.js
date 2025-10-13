import express from "express";
import cookieParser from "cookie-parser";
import products from "./routes/productRoutes.js";
import users from "./routes/userRoutes.js";
import errorHandleMiddleware from "./middleware/error.js";
import admins from './routes/adminRoutes.js';
import orders from './routes/orderRoutes.js';
import cors from "cors";



const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin:  process.env.FRONTEND_URL, // your React app’s URL
  credentials: true,               // if you’re using cookies/auth
}));



// Routes
app.use("/api/v1/products", products);
app.use("/api/v1/users", users);
app.use("/api/v1/admin", admins);
app.use("/api/v1/orders", orders);

// Error handling middleware
app.use(errorHandleMiddleware);




export default app;
