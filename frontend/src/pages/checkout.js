"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiLock,
  FiShield,
  FiCreditCard,
  FiMapPin,
  FiUser,
  FiDollarSign,
  FiAlertCircle,
  FiCheck,
  FiStar,
  FiX,
} from "react-icons/fi";
import Script from "next/script";
import { useAuth } from "../context/AuthContext";

const Checkout = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [selectedInsurance, setSelectedInsurance] = useState({});
  const [priceDetails, setPriceDetails] = useState({
    subtotal: 0,
    discountAmount: 0,
    insuranceCost: 0,
    gst: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [checkoutData, setCheckoutData] = useState(null);
  const [userInfo, setUserInfo] = useState({
    name: "",
    address: "",
    phone: "",
  });
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [review, setReview] = useState({
    rating: 0,
    comment: "",
  });
  const [orderId, setOrderId] = useState(null);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    // Check authentication status
    if (!user) {
      router.push("/login");
      return;
    }

    setIsAuthenticated(true);

    // Load checkout data from localStorage
    try {
      const savedCheckoutData = JSON.parse(
        localStorage.getItem("checkoutData") || "{}"
      );
      console.log("Loaded checkoutData in Checkout:", savedCheckoutData);
      if (savedCheckoutData && savedCheckoutData.items) {
        setCheckoutData(savedCheckoutData);
        setCart(savedCheckoutData.items || []);
        setDiscount(savedCheckoutData.discount || 0);

        // Properly format insurance data
        const formattedInsurances = {};
        Object.entries(savedCheckoutData.insurances || {}).forEach(
          ([cartItemId, plan]) => {
            if (plan) {
              formattedInsurances[cartItemId] = {
                _id: plan._id,
                name: plan.name,
                price: parseFloat(plan.price) || 0,
                coverage: plan.coverage,
                benefits: plan.benefits,
              };
            }
          }
        );
        setSelectedInsurance(formattedInsurances);

        setPriceDetails({
          subtotal: savedCheckoutData.subtotal || 0,
          discountAmount: savedCheckoutData.discountAmount || 0,
          insuranceCost: savedCheckoutData.insuranceCost || 0,
          gst: savedCheckoutData.gst || 0,
          total: savedCheckoutData.total || 0,
        });

        // Pre-fill userInfo if user data is available
        if (user) {
          setUserInfo({
            name: user.name || "",
            phone: user.phone || "",
            address: user.address || "",
          });
        }
      } else {
        setError("No checkout data found. Please review your cart.");
      }
    } catch (err) {
      console.error("Error parsing checkoutData:", err);
      setError("Invalid checkout data. Please return to cart.");
    } finally {
      setLoading(false);
    }
  }, [user, router]);

  // Handle input changes for user info
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      setError("");

      // Validate authentication
      const token = localStorage.getItem("token");
      if (!token || !user) {
        setError("Please login to place an order");
        router.push("/login");
        return;
      }

      // Validate user info
      if (!userInfo.name || !userInfo.phone || !userInfo.address) {
        setError("Please fill in all required fields (Name, Phone, Address)");
        return;
      }

      // Validate phone number format (10 digits)
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(userInfo.phone.trim())) {
        setError("Please enter a valid 10-digit phone number");
        return;
      }

      // Transform cart items into the format expected by the backend
      const items = cart.map((item) => {
        const baseItem = {
          name: item.name || "",
          type: item.type || "buy",
          fromDate: item.fromDate || new Date().toISOString(),
          toDate:
            item.toDate ||
            new Date(
              Date.now() + (item.days || 1) * 24 * 60 * 60 * 1000
            ).toISOString(),
        };

        // Check if the item is a product (has productId or is a product type)
        if (
          item.productId ||
          item.type === "product" ||
          item.name === "Dog Toy"
        ) {
          return {
            ...baseItem,
            type: "product",
            productId: item.productId || item._id || item.id,
            buyPrice: parseFloat(item.buyPrice) || 0,
            rentPrice: 0,
            deposit: 0,
            days: 0,
          };
        } else {
          return {
            ...baseItem,
            petId: item.petId || item._id || item.id,
            buyPrice: parseFloat(item.buyPrice) || 0,
            rentPrice: parseFloat(item.rentPrice) || 0,
            deposit: parseFloat(item.deposit) || 0,
            days: parseInt(item.days) || 1,
          };
        }
      });

      // Calculate totals using reduce
      const totals = cart.reduce(
        (acc, item) => {
          if (item.type === "rent") {
            acc.totalRent +=
              (parseFloat(item.rentPrice) || 0) * (parseInt(item.days) || 1);
            acc.totalDeposit += parseFloat(item.deposit) || 0;
          } else {
            acc.totalBuy += parseFloat(item.buyPrice) || 0;
          }
          return acc;
        },
        { totalRent: 0, totalBuy: 0, totalDeposit: 0 }
      );

      // Get user ID from auth context
      const userId = user._id || user.id;
      if (!userId) {
        throw new Error("User ID not found. Please try logging in again.");
      }

      // Prepare order data
      const orderData = {
        userId: userId,
        items: items,
        userInfo: {
          name: userInfo.name.trim(),
          phone: userInfo.phone.trim(),
          email: user.email || "",
          address: userInfo.address.trim(),
        },
        paymentMethod,
        totalRent: totals.totalRent,
        totalBuy: totals.totalBuy,
        totalDeposit: totals.totalDeposit,
        gst: parseFloat(priceDetails.gst) || 0,
        amount: parseFloat(priceDetails.total) || 0,
        currency: "INR",
        status: "pending",
      };

      console.log("Complete order data:", JSON.stringify(orderData, null, 2));

      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create order");
      }

      const data = await response.json();
      console.log("Order created successfully:", data);
      setOrderId(data.order._id);

      if (paymentMethod === "COD") {
        // For COD orders, clear cart and show review popup
        localStorage.removeItem("cart");
        localStorage.removeItem("checkoutData");
        localStorage.removeItem("selectedInsurances");
        setShowReviewPopup(true);
      } else {
        // Handle Razorpay payment
        // ... existing Razorpay code ...
      }
    } catch (error) {
      console.error("Error placing order:", error);
      setError(error.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    try {
      // If user clicks submit without rating, treat it as skipping review
      if (!review.rating) {
        // Clear data and redirect to orders page
        localStorage.removeItem("cart");
        localStorage.removeItem("checkoutData");
        localStorage.removeItem("selectedInsurances");
        setShowReviewPopup(false);
        router.push("/");
        return;
      }

      // If rating is provided, submit the review
      const token = localStorage.getItem("token");
      if (!token || !user?._id || !orderId) {
        console.log("Missing required data for review:", {
          token,
          userId: user?._id,
          orderId,
        });
        // Still proceed to orders page
        router.push("/");
        return;
      }

      // Submit review for each pet in the cart
      for (const item of cart) {
        try {
          const petId = item.petId || item._id || item.id;
          if (!petId) {
            console.log("Skipping review - no petId for item:", item);
            continue;
          }

          const reviewData = {
            orderId,
            petId,
            userId: user._id,
            rating: parseInt(review.rating),
            comment: review.comment || "",
          };

          console.log("Submitting review:", reviewData);

          const response = await fetch("http://localhost:5000/api/reviews", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(reviewData),
          });

          const result = await response.json();
          if (!response.ok) {
            console.log("Review submission failed:", result);
          } else {
            console.log("Review submitted successfully:", result);
          }
        } catch (error) {
          console.log("Error submitting individual review:", error);
        }
      }

      // Clear data and redirect regardless of review submission success
      localStorage.removeItem("cart");
      localStorage.removeItem("checkoutData");
      localStorage.removeItem("selectedInsurances");
      setShowReviewPopup(false);
      router.push("/");
    } catch (error) {
      console.log("Error in review submission process:", error);
      // Redirect to orders page even if there's an error
      router.push("/");
    }
  };

  // Update the animation variants
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onError={() =>
          setError(
            "Failed to load Razorpay script. Please disable ad blockers."
          )
        }
      />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-12"
          >
            {/* Checkout Header */}
            <motion.div variants={itemVariants} className="text-center">
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Checkout
              </h1>
              <p className="mt-4 text-lg sm:text-xl text-gray-600">
                Complete your order by providing the details below
              </p>
            </motion.div>

            {error && (
              <motion.div
                variants={itemVariants}
                className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FiAlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Order Summary Section */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
            >
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                    Order Summary
                  </h2>
                  <span className="text-sm px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full font-medium">
                    {cart.length} items
                  </span>
                </div>

                {/* Cart Items */}
                <div className="divide-y divide-gray-200">
                  {cart.length > 0 ? (
                    cart.map((item, index) => (
                      <motion.div
                        key={item.cartItemId || item._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="py-6 flex space-x-6 hover:bg-gray-50 rounded-xl transition-colors duration-300 p-4"
                      >
                        <div className="relative h-24 w-24 group">
                          <img
                            src={item.imageUrl || "/placeholder.jpg"}
                            alt={item.name || "Item"}
                            className="h-24 w-24 object-cover rounded-lg flex-shrink-0 transform transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300 rounded-lg" />
                        </div>
                        <div className="flex-1 flex flex-col">
                          <div className="flex justify-between">
                            <h3 className="text-lg font-medium text-gray-900 hover:text-indigo-600 transition-colors duration-300">
                              {item.name || "Unnamed Item"}
                            </h3>
                            <p className="text-lg font-medium text-gray-900">
                              ₹
                              {item.type === "rent"
                                ? (parseFloat(item.rentPrice) || 0) *
                                  (parseInt(item.days) || 1)
                                : parseFloat(item.buyPrice) || 0}
                            </p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            {item.type === "rent"
                              ? `${item.days || 1} days rental`
                              : "Purchase"}
                          </p>
                          {selectedInsurance[item.cartItemId] && (
                            <div className="mt-2 text-sm text-indigo-600">
                              Insurance:{" "}
                              {selectedInsurance[item.cartItemId].name} (₹
                              {selectedInsurance[item.cartItemId].price}
                              /month)
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <p className="py-6 text-gray-500">No items in cart.</p>
                  )}
                </div>

                {/* Price Details */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-8 border-t border-gray-200 pt-6 space-y-4"
                >
                  <div className="flex justify-between text-base text-gray-600 hover:text-gray-900 transition-colors duration-300">
                    <p>Subtotal</p>
                    <p>₹{priceDetails.subtotal.toLocaleString()}</p>
                  </div>
                  {priceDetails.discountAmount > 0 && (
                    <div className="flex justify-between text-base text-green-600 hover:text-green-700 transition-colors duration-300">
                      <p>Discount ({discount}%)</p>
                      <p>-₹{priceDetails.discountAmount.toLocaleString()}</p>
                    </div>
                  )}
                  {priceDetails.insuranceCost > 0 && (
                    <div className="flex justify-between text-base text-indigo-600 hover:text-indigo-700 transition-colors duration-300">
                      <p>Insurance Cost</p>
                      <p>
                        ₹{priceDetails.insuranceCost.toLocaleString()}/month
                      </p>
                    </div>
                  )}
                  <div className="flex justify-between text-base text-gray-600 hover:text-gray-900 transition-colors duration-300">
                    <p>GST (18%)</p>
                    <p>₹{priceDetails.gst.toLocaleString()}</p>
                  </div>
                  <div className="flex justify-between text-xl font-medium text-gray-900 pt-4 border-t border-gray-200">
                    <p>Total</p>
                    <p className="text-indigo-600">
                      ₹{priceDetails.total.toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* User Information Form */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 hover:shadow-2xl transition-all duration-300"
            >
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-8">
                Delivery Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={userInfo.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={userInfo.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="md:col-span-2">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Delivery Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={userInfo.address}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900"
                    placeholder="Enter your complete delivery address"
                  />
                </div>
              </div>
              <div className="mt-6 flex items-center text-sm text-gray-500">
                <FiMapPin className="h-5 w-5 mr-2" />
                <p>We'll deliver your order to this address</p>
              </div>
            </motion.div>

            {/* Payment Method Section */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 hover:shadow-2xl transition-all duration-300"
            >
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-8">
                Payment Method
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPaymentMethod("COD")}
                  className={`relative flex flex-col items-center justify-center p-8 rounded-xl border-2 transition-all duration-300 ${
                    paymentMethod === "COD"
                      ? "border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50"
                      : "border-gray-200 hover:border-indigo-200 hover:bg-gray-50"
                  }`}
                >
                  <FiDollarSign
                    className={`h-10 w-10 mb-3 transition-colors duration-300 ${
                      paymentMethod === "COD"
                        ? "text-indigo-500"
                        : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`font-medium transition-colors duration-300 ${
                      paymentMethod === "COD"
                        ? "text-indigo-900"
                        : "text-gray-900"
                    }`}
                  >
                    Cash on Delivery
                  </span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPaymentMethod("Online")}
                  className={`relative flex flex-col items-center justify-center p-8 rounded-xl border-2 transition-all duration-300 ${
                    paymentMethod === "Online"
                      ? "border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50"
                      : "border-gray-200 hover:border-indigo-200 hover:bg-gray-50"
                  }`}
                >
                  <FiCreditCard
                    className={`h-10 w-10 mb-3 transition-colors duration-300 ${
                      paymentMethod === "Online"
                        ? "text-indigo-500"
                        : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`font-medium transition-colors duration-300 ${
                      paymentMethod === "Online"
                        ? "text-indigo-900"
                        : "text-gray-900"
                    }`}
                  >
                    Online Payment
                  </span>
                </motion.button>
              </div>
            </motion.div>

            {/* Place Order Button */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl p-4 shadow-xl"
            >
              <motion.button
                whileHover={{
                  scale: 1.02,
                  boxShadow:
                    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePlaceOrder}
                disabled={loading || cart.length === 0}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-8 rounded-xl font-medium text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-300 shadow-lg hover:shadow-xl disabled:hover:scale-100"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </div>
                ) : paymentMethod === "COD" ? (
                  "Place Order"
                ) : (
                  "Pay Now"
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Review Popup */}
      <AnimatePresence>
        {showReviewPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Rate Your Experience
                </h2>
                <button
                  onClick={() => {
                    setShowReviewPopup(false);
                    router.push("/");
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Rating (Optional)
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReview({ ...review, rating: star })}
                      className={`text-2xl ${
                        star <= review.rating
                          ? "text-yellow-400"
                          : "text-gray-300"
                      } hover:text-yellow-400 transition-colors duration-200`}
                    >
                      <FiStar className="h-8 w-8" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Your Review (Optional)
                </label>
                <textarea
                  value={review.comment}
                  onChange={(e) =>
                    setReview({ ...review, comment: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900"
                  rows="4"
                  placeholder="Share your experience with us (optional)..."
                />
              </div>

              <div className="flex flex-col space-y-3">
                <button
                  onClick={handleReviewSubmit}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                >
                  {review.rating ? "Submit Review" : "Skip Review"}
                </button>

                <button
                  onClick={() => {
                    setShowReviewPopup(false);
                    router.push("/");
                  }}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300"
                >
                  View Orders
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Checkout;
