import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import Order from "../models/Order.js";

dotenv.config();

// ✅ Initialize Razorpay Instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Create Razorpay Order
export const createOrder = async (req, res) => {
  try {
    console.log("Incoming Order Data:", req.body); // ✅ Debug incoming data

    const { userId, pets, amount } = req.body;

    // ✅ Validate request data
    if (!userId || !pets || pets.length === 0 || !amount) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // ✅ Ensure each pet has a `petId`
    for (let i = 0; i < pets.length; i++) {
      if (!pets[i].petId) {
        return res.status(400).json({ success: false, message: `Pet at index ${i} is missing petId` });
      }
    }

    // ✅ Create order in Razorpay
    const razorpayOrder = await razorpay.orders.create({
      amount: amount, // Razorpay works in paise
      currency: "INR",
      payment_capture: 1,
    });

    // ✅ Save order in the database
    const newOrder = new Order({
      userId,
      pets,
      amount,
      currency: "INR",
      status: "pending",
      orderId: razorpayOrder.id, // Store the Razorpay order ID
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: razorpayOrder,
    });
  } catch (error) {
    console.error("❌ Error in createOrder:", error);
    res.status(500).json({ success: false, message: "Failed to create order" });
  }
};

// ✅ Verify Payment Signature
export const verifyPayment = async (req, res) => {
  try {
    const { order_id, payment_id, signature } = req.body;

    if (!order_id || !payment_id || !signature) {
      return res.status(400).json({ success: false, message: "Missing payment details" });
    }

    // ✅ Find the order using Razorpay order ID
    const order = await Order.findOne({ orderId: order_id });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // ✅ Generate signature to compare
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${order_id}|${payment_id}`)
      .digest("hex");

    if (generatedSignature === signature) {
      // ✅ Update order as paid
      order.paymentId = payment_id;
      order.status = "paid";
      await order.save();

      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      res.status(400).json({ success: false, message: "Invalid payment signature" });
    }
  } catch (error) {
    console.error("❌ Error in verifyPayment:", error);
    res.status(500).json({ success: false, message: "Payment verification failed" });
  }
};
