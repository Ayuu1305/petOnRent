// D:\major-project\frontend\lib\models\Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  items: [
    {
      petId: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        enum: ["rent", "buy"],
        required: true,
      },
      rentPrice: {
        type: Number,
        default: 0,
      },
      buyPrice: {
        type: Number,
        default: 0,
      },
      deposit: {
        type: Number,
        default: 0,
      },
      days: {
        type: Number,
        default: 0,
      },
      fromDate: {
        type: String,
      },
      toDate: {
        type: String,
      },
    },
  ],
  userInfo: {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    address: {
      type: String,
      required: true,
    },
  },
  paymentMethod: {
    type: String,
    enum: ["COD", "Online"],
    required: true,
  },
  paymentId: {
    type: String, // Razorpay payment ID for Online payments
  },
  totalRent: {
    type: Number,
    required: true,
  },
  totalBuy: {
    type: Number,
    required: true,
  },
  totalDeposit: {
    type: Number,
    required: true,
  },
  gst: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Completed", "Failed"],
    default: "Pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent model recompilation in development by checking if it already exists
export default mongoose.models.Order || mongoose.model("Order", orderSchema);