import dotenv from "dotenv";
import app from "./app.js";
import { connectMongoDB } from "./config/db.js";
import express from "express"; 
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Load environment variables FIRST
dotenv.config({ path: path.resolve(__dirname, "config/.env") });

// --- FRONTEND GLUE CODE ---
app.use(express.static(path.join(__dirname, "public")));

// 2. Handle React routing with a REGEX catch-all
app.get(/.*/, (req, res) => {
  res.sendFile(path.resolve(__dirname, "public", "index.html"));
});

// 3. GLOBAL ERROR HANDLER (This catches the "500" and prints the reason)
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

// 4. Connect to MongoDB and then start the server
const PORT = process.env.PORT || 8080;

connectMongoDB()
  .then(() => {
    console.log("✅ MongoDB Connected successfully");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
    process.exit(1); // Exit so Cloud Run knows to restart the container
  });

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  process.exit(1);
});
