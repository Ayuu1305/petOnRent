import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import petRoutes from "./routes/petRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import insuranceRoutes from "./routes/insuranceRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import issueRoutes from "./routes/issueRoutes.js";
import Order from "./models/Order.js";
import Pet from "./models/Pet.js";
import Razorpay from "razorpay";
import userAuth from "./middleware/userAuth.js";

dotenv.config();

const app = express();

// CORS configuration
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Initialize Razorpay
console.log("Razorpay Keys:", {
  key_id: process.env.RAZORPAY_KEY_ID ? "Set" : "Not set",
  key_secret: process.env.RAZORPAY_KEY_SECRET ? "Set" : "Not set",
});

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
console.log("Razorpay instance created:", razorpay ? "Yes" : "No");

// Register Routes
app.use("/api/auth", userRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/insurance", insuranceRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/issues", issueRoutes);
console.log("✅ All routes loaded");

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI environment variable is not defined");
    }

    console.log("🔗 Attempting to connect to MongoDB...");
    // Hide credentials in logs
    const sanitizedUri = mongoUri.replace(
      /mongodb\+srv:\/\/([^:]+):([^@]+)@/,
      "mongodb+srv://****:****@"
    );
    console.log("MongoDB URI:", sanitizedUri);

    await mongoose.connect(mongoUri, {
      dbName: "petOnRent",
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      retryWrites: true,
      w: "majority",
    });
    console.log("✅ MongoDB connected successfully!");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("Error details:", {
      name: err.name,
      code: err.code,
      reason: err.reason?.message,
      errorLabels: Array.from(err.errorLabels || []),
    });

    // Check for specific error types
    if (err.message.includes("ENOTFOUND")) {
      console.error(
        "DNS lookup failed. Please check if the MongoDB URI is correct."
      );
    } else if (err.message.includes("Authentication failed")) {
      console.error(
        "Authentication failed. Please check username and password."
      );
    }

    console.log("Retrying in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};

// Error Handling for Crashes
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection:", reason);
  process.exit(1);
});

// Start Server
const PORT = process.env.PORT || 10000;
connectDB().then(() => {
  app.listen(PORT, "0.0.0.0", () =>
    console.log(`🚀 Server running on port ${PORT}`)
  );
});
