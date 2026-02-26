import dotenv from "dotenv";
import app from "./app.js";
import { connectMongoDB } from "./config/db.js";
import express from "express"; 
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "config/.env") });

app.use(express.static(path.join(__dirname, "public")));

app.get(/.*/, (req, res) => {
  res.sendFile(path.resolve(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 8080;

// NEW START LOGIC: Start listening first, then connect DB
// This ensures Google Cloud Run health checks ALWAYS pass
app.listen(PORT, async () => {
  console.log(`🚀 Server listening on port ${PORT}`);
  
  try {
    await connectMongoDB();
  } catch (err) {
    console.error("⚠️ Server started but MongoDB failed to connect.");
  }
});
