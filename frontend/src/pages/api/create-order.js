import Razorpay from "razorpay";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { amount } = req.body; // ✅ Amount should already be in paise

  // ✅ Ensure amount is within Razorpay limits
  if (!amount || amount <= 0 || amount > 50000000) { // ₹5,00,000 max
    return res.status(400).json({
      success: false,
      message: "Invalid amount. Please enter a valid amount within allowed limits.",
    });
  }

  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount, // ✅ Amount in paise
      currency: "INR",
      receipt: `order_rcptid_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    return res.status(500).json({ success: false, message: "Razorpay order creation failed." });
  }
}
