import dotenv from "dotenv";
import app from "./app.js";
import { connectMongoDB } from "./config/db.js";
import express from "express"; 
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "config/.env") });

// Connect to MongoDB
connectMongoDB();

// --- FRONTEND GLUE CODE ---
// 1. Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, "public")));

// 2. Handle React routing with a REGEX catch-all
// We use /.*/ as a regular expression literal to bypass Express 5's string parser
app.get(/.*/, (req, res) => {
  res.sendFile(path.resolve(__dirname, "public", "index.html"));
});

// Start server
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
