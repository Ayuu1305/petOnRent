import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["rent", "buy", "product"],
    required: true,
  },
  petId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pet",
    required: function () {
      return !this.productId;
    },
  },
  productId: {
    type: String,
    required: function () {
      return !this.petId;
    },
  },
  rentPrice: {
    type: Number,
    default: 0,
  },
  buyPrice: {
    type: Number,
    default: 0,
  },
  days: {
    type: Number,
    default: 0,
  },
  deposit: {
    type: Number,
    default: 0,
  },
  fromDate: {
    type: Date,
    required: true,
  },
  toDate: {
    type: Date,
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
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
        default: "",
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
    totalRent: {
      type: Number,
      default: 0,
    },
    totalBuy: {
      type: Number,
      default: 0,
    },
    totalDeposit: {
      type: Number,
      default: 0,
    },
    gst: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
