// Safely get Razorpay key from environment
export const getRazorpayKey = () => {
  // Only expose the public key, never the secret
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
};

// Initialize Razorpay options
export const initRazorpayOptions = (orderData) => {
  return {
    key: getRazorpayKey(),
    amount: orderData.amount,
    currency: orderData.currency,
    name: "Pet On Rent",
    description: "Pet Rental Payment",
    order_id: orderData.id,
    handler: function (response) {
      // Handle payment success
      console.log(response);
    },
    prefill: {
      name: orderData.name,
      email: orderData.email,
      contact: orderData.phone,
    },
    theme: {
      color: "#3399cc",
    },
  };
};
