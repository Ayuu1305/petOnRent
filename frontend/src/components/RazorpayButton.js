import { useState } from "react";

const RazorpayButton = ({ userId, pets, amount }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    try {
      // ✅ Step 1: Create order from backend
      const response = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, pets, amount }),
      });

      const orderData = await response.json();
      if (!orderData.success) {
        alert("Order creation failed!");
        setLoading(false);
        return;
      }

      // ✅ Step 2: Open Razorpay payment popup
      const options = {
        key: orderData.key_id, // Razorpay public key
        amount: amount * 100, // Convert INR to paise
        currency: "INR",
        name: "PetOnRent",
        description: "Rent your favorite pet",
        order_id: orderData.orderId, // Razorpay order ID
        handler: async function (response) {
          console.log("Payment Response:", response);

          // ✅ Step 3: Verify payment on backend
          const verifyRes = await fetch("/api/payment/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            alert("Payment Successful!");
          } else {
            alert("Payment Verification Failed!");
          }
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Payment process failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="bg-blue-600 text-white px-4 py-2 rounded"
    >
      {loading ? "Processing..." : "Pay with Razorpay"}
    </button>
  );
};

export default RazorpayButton;
