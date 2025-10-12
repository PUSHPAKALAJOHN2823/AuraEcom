import dotenv from "dotenv";
import app from "./app.js";
import { connectMongoDB } from "./config/db.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "config/.env") });


// Check if DB_URI is loaded (debug)
console.log("DB_URI from env:", process.env.DB_URI);

// Connect to MongoDB
connectMongoDB();



// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  console.log("Shutting down server due to unhandled promise rejection");
  server.close(() => process.exit(1));
});


