import express from "express";
import Order from "../models/Order.js";
import userAuth from "../middleware/userAuth.js";
import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create a new order
router.post("/", userAuth, async (req, res) => {
  try {
    const orderData = req.body;

    // Validate required fields
    if (!orderData.items || !orderData.items.length) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one item",
      });
    }

    if (!orderData.userInfo || !orderData.paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userInfo or paymentMethod",
      });
    }

    // Validate each item
    for (const item of orderData.items) {
      if (!item.name || !item.type) {
        return res.status(400).json({
          success: false,
          message: "Each item must have a name and type",
        });
      }

      // Check if either petId or productId is present
      if (!item.petId && !item.productId) {
        return res.status(400).json({
          success: false,
          message: "Each item must have either a petId or productId",
        });
      }

      // Validate dates
      if (!item.fromDate || !item.toDate) {
        return res.status(400).json({
          success: false,
          message: "Each item must have fromDate and toDate",
        });
      }
    }

    // Set userId from authenticated user
    orderData.userId = req.user.id;

    const order = new Order(orderData);
    await order.save();
    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error("Error creating order:", error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
});

// Get all orders for a user
router.get("/", userAuth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
});

// Get a single order
router.get("/:id", userAuth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message,
    });
  }
});

// Create order
router.post("/create", async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0 || amount > 50000000) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid amount. Please enter a valid amount within allowed limits.",
    });
  }

  try {
    const options = {
      amount,
      currency: "INR",
      receipt: `order_rcptid_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Razorpay order creation failed." });
  }
});

export default router;
