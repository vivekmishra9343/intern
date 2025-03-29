const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Import routes
const userRoutes = require("./routes/userRoutes");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/user-form")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
