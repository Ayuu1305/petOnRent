import express from "express";
import { createOrder, verifyPayment } from "../controllers/paymentController.js";

const router = express.Router();

// router.post("/create-order", createOrder); // Create Razorpay order

router.post("/verify-payment", verifyPayment); // Verify payment

export default router;
