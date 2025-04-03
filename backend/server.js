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
import Order from "./models/Order.js";
import Pet from "./models/Pet.js";
import Razorpay from "razorpay";
import userAuth from "./middleware/userAuth.js";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// Initialize Razorpay
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
console.log("✅ All routes loaded");

// Protected route - Create Razorpay order (requires authentication)
app.post("/api/create-order", userAuth, async (req, res) => {
  const { amount } = req.body;
  const userId = req.user.id;

  try {
    if (!amount) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required field: amount" });
    }

    const shortUserId = userId.slice(0, 10);
    const shortTimestamp = Date.now().toString().slice(-6);
    const receipt = `rcpt_${shortUserId}_${shortTimestamp}`;

    const options = {
      amount: amount,
      currency: "INR",
      receipt: receipt,
    };

    console.log("Creating Razorpay order with options:", options);
    const razorpayOrder = await razorpay.orders.create(options);
    console.log("Razorpay order created:", razorpayOrder);

    res.json({
      success: true,
      order: {
        razorpay_order_id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create Razorpay order",
      error: error.message || "Unknown error",
    });
  }
});

// POST /api/reviews - Add a review for a pet
app.post("/api/reviews", async (req, res) => {
  const { petId, userId, rating, comment } = req.body;

  try {
    // Validate input
    if (!petId || !userId || !rating) {
      return res
        .status(400)
        .json({ message: "Missing required fields: petId, userId, or rating" });
    }
    if (!mongoose.Types.ObjectId.isValid(petId)) {
      return res.status(400).json({ message: "Invalid petId format" });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be an integer between 1 and 5" });
    }

    const pet = await Pet.findById(petId);
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    // Check for duplicate review from the same user
    const existingReview = pet.reviews.find((r) => r.userId === userId);
    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this pet" });
    }

    pet.reviews.push({ userId, rating, comment: comment || "" });
    pet.averageRating =
      pet.reviews.reduce((acc, r) => acc + r.rating, 0) / pet.reviews.length;
    await pet.save();

    res.status(201).json({ message: "Review added", pet });
  } catch (error) {
    console.error("Error adding review:", error);
    res
      .status(500)
      .json({ message: "Error adding review", error: error.message });
  }
});

// MongoDB Connection with Retry Logic
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not defined");
    }

    console.log("🔗 Attempting to connect to MongoDB...");
    console.log(
      "MongoDB URI:",
      process.env.MONGO_URI.replace(/\/\/[^@]+@/, "//****:****@")
    ); // Log URI with credentials hidden

    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "petOnRent",
    });
    console.log("✅ MongoDB connected successfully!");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("Error details:", {
      name: err.name,
      code: err.code,
      reason: err.reason?.message,
    });
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
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  );
});
