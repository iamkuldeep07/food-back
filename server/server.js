import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js"; // optional

dotenv.config({
  path: "./.env"
});



const app = express();

// Middleware
app.use(cors({
  origin: "*"
}));
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/upload", uploadRoutes); // optional

// Health check
app.get("/", (req, res) => res.send("Food-back Hub API is running"));

// Global error handler (simple)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ message: err.message || "Server Error" });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// DB Connection
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });