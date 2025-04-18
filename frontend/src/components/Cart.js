"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  FiX,
  FiShoppingCart,
  FiMinusCircle,
  FiPlusCircle,
  FiPlus,
  FiLock,
  FiUnlock,
  FiShield,
  FiArrowLeft,
  FiCheck,
} from "react-icons/fi";
import { v4 as uuidv4 } from "uuid";
import { useCart } from "../context/CartContext";
import { useRouter } from "next/router";

// Suggested products
const suggestedProducts = [
  {
    id: "sugg1",
    name: "Dog Adult",
    price: 499,
    image: "/images/suggested product/pedi.jpg",
    type: "dog",
    isPet: false,
  },
  {
    id: "sugg2",
    name: "Dog Toy",
    price: 799,
    image: "/images/suggested product/dogtoy.jpg",
    type: "dog",
    isPet: false,
  },
  {
    id: "sugg3",
    name: "Cat Whiskas",
    price: 399,
    image: "/images/suggested product/catwhiskas.jpg",
    type: "cat",
    isPet: false,
  },
  {
    id: "sugg4",
    name: "Birdseed",
    price: 299,
    image: "/images/suggested product/birdseed.jpg",
    type: "bird",
    isPet: false,
  },
  {
    id: "sugg5",
    name: "Bird Perch",
    price: 599,
    image: "/images/suggested product/birdperch.jpg",
    type: "bird",
    isPet: false,
  },
];

// Debounce utility to prevent rapid successive updates to localStorage
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const Cart = ({ isOpen, onClose }) => {
  const [isClient, setIsClient] = useState(false);
  const [cart, setCart] = useState([]);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [suggestions, setSuggestions] = useState(suggestedProducts);
  const [offers] = useState([
    { code: "SAVE10", threshold: 3000, discount: 10 },
    { code: "SAVE15", threshold: 5000, discount: 15 },
    { code: "SAVE20", threshold: 10000, discount: 20 },
  ]);
  const { updateCartCount } = useCart();
  const [priceDetails, setPriceDetails] = useState({
    subtotal: 0,
    discount: 0,
    discountAmount: 0,
    gst: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  // Load cart when cart opens
  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsClient(true);
    try {
      // Load cart
      const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
      const validatedCart = savedCart.map((item) => {
        const cartItemId = item.cartItemId || `${item.petId}-${Date.now()}`;
        return {
          ...item,
          cartItemId,
          imageUrl: item.imageUrl || item.image || "/images/placeholder.jpg",
          category: item.category || item.type || "unknown",
          isPet:
            item.isPet !== undefined
              ? item.isPet
              : item.type === "rent" || item.type === "buy",
        };
      });

      // Update state and localStorage
      setCart(validatedCart);
      localStorage.setItem("cart", JSON.stringify(validatedCart));
      updateCartCount(validatedCart.length);
      updateSuggestions(validatedCart);

      // Load saved discount if exists
      const savedDiscount = localStorage.getItem("cartDiscount");
      const savedCoupon = localStorage.getItem("cartCoupon");
      if (savedDiscount && savedCoupon) {
        setDiscount(Number(savedDiscount));
        setCoupon(savedCoupon);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      setCart([]);
      updateCartCount(0);
    }
  }, [isOpen]);

  // Update price details when cart or discount changes
  useEffect(() => {
    if (cart.length > 0) {
      const totalRent = cart.reduce((acc, item) => {
        return item.type === "rent"
          ? acc + (parseInt(item.rentPrice) || 0) * (parseInt(item.days) || 1)
          : acc;
      }, 0);

      const totalBuy = cart.reduce((acc, item) => {
        return item.type === "buy" ? acc + (parseInt(item.buyPrice) || 0) : acc;
      }, 0);

      const subtotal = totalRent + totalBuy;
      // Only calculate discount if one has been explicitly applied
      const discountAmount = discount > 0 ? (subtotal * discount) / 100 : 0;
      const subtotalAfterDiscount = subtotal - discountAmount;
      const gst = subtotalAfterDiscount * 0.18;
      const total = subtotalAfterDiscount + gst;

      const updatedPriceDetails = {
        subtotal,
        discount: discount || 0, // Only use discount if explicitly set
        discountAmount,
        gst: parseFloat(gst.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
      };

      setPriceDetails(updatedPriceDetails);
    } else {
      const updatedPriceDetails = {
        subtotal: 0,
        discount: 0,
        discountAmount: 0,
        gst: 0,
        total: 0,
      };
      setPriceDetails(updatedPriceDetails);
    }
  }, [cart, discount]);

  // Handle body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Update suggestions based on cart items
  const updateSuggestions = (currentCart) => {
    if (currentCart.length === 0) {
      setSuggestions(suggestedProducts);
      return;
    }
    const petTypes = currentCart.map((item) =>
      (item.category || item.type || "").toLowerCase()
    );
    const filteredSuggestions = suggestedProducts.filter((suggestion) =>
      petTypes.includes(suggestion.type.toLowerCase())
    );
    setSuggestions(
      filteredSuggestions.length > 0 ? filteredSuggestions : suggestedProducts
    );
  };

  const updateCart = (updatedCart) => {
    const newCart = updatedCart.map((item) => {
      const cartItemId = item.cartItemId || item.id || uuidv4();
      return {
        ...item,
        cartItemId,
        imageUrl: item.imageUrl || item.image || "/images/placeholder.jpg",
        category: item.category || item.type || "unknown",
        isPet:
          item.isPet !== undefined
            ? item.isPet
            : item.type === "rent" || item.type === "buy",
      };
    });
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    updateCartCount(newCart.length);
    updateSuggestions(newCart);
  };

  const removeFromCart = (cartItemId) => {
    // Remove item from cart
    const updatedCart = cart.filter((item) => item.cartItemId !== cartItemId);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    updateCartCount(updatedCart.length);
    updateSuggestions(updatedCart);

    // Clear discount and coupon
    setDiscount(0);
    setCoupon("");
    localStorage.removeItem("cartDiscount");
    localStorage.removeItem("cartCoupon");

    // Update price details without discount
    const subtotal = updatedCart.reduce((acc, item) => {
      if (item.type === "rent") {
        return (
          acc + (parseInt(item.rentPrice) || 0) * (parseInt(item.days) || 1)
        );
      } else {
        return acc + (parseInt(item.buyPrice) || 0);
      }
    }, 0);

    const gst = subtotal * 0.18;
    const total = subtotal + gst;

    setPriceDetails({
      subtotal,
      discount: 0,
      discountAmount: 0,
      gst,
      total,
    });
  };

  const addSuggestedItem = (suggestion) => {
    const newItem = {
      ...suggestion,
      cartItemId: uuidv4(),
      type: "buy",
      buyPrice: suggestion.price,
      isPet: false,
    };
    const updatedCart = [...cart, newItem];
    updateCart(updatedCart);
  };

  const calculateSubtotal = () => {
    let subtotal = 0;
    cart.forEach((item) => {
      if (item.type === "buy") {
        subtotal += (item.buyPrice || 0) * (item.quantity || 1);
      } else if (item.type === "rent") {
        subtotal += (item.rentPrice || 0) * (item.days || 1);
      }
    });
    return subtotal;
  };

  const handleCouponSubmit = () => {
    const subtotal = calculateSubtotal();

    // Check if a coupon is already applied
    if (discount > 0) {
      setError(
        "A coupon is already applied. Remove it first to apply a new one."
      );
      setTimeout(() => setError(""), 3000);
      return;
    }

    // Find the offer based on the entered coupon code
    const offer = offers.find((o) => o.code === coupon.toUpperCase());

    if (!offer) {
      setError("Invalid coupon code");
      setTimeout(() => setError(""), 3000);
      return;
    }

    // Check if the cart value meets the threshold
    if (subtotal < offer.threshold) {
      setError(
        `Minimum order value of ₹${offer.threshold.toLocaleString()} required for this coupon`
      );
      setTimeout(() => setError(""), 3000);
      return;
    }

    // Apply the discount and save both discount and coupon code
    setDiscount(offer.discount);
    localStorage.setItem("cartDiscount", offer.discount.toString());
    localStorage.setItem("cartCoupon", coupon.toUpperCase());
    setSuccessMessage(
      `Coupon ${offer.code} applied! ${offer.discount}% discount`
    );
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is logged in
      const token = localStorage.getItem("token");
      if (!token) {
        // Store the current URL to redirect back after login
        localStorage.setItem("redirectAfterLogin", window.location.pathname);
        router.push("/login");
        return;
      }

      const checkoutData = {
        items: cart,
        discount: priceDetails.discount,
        discountAmount: priceDetails.discountAmount,
        gst: priceDetails.gst,
        subtotal: priceDetails.subtotal,
        total: priceDetails.total,
      };

      // Store checkout data without clearing cart
      localStorage.setItem("checkoutData", JSON.stringify(checkoutData));

      // Navigate to checkout page
      router.push("/checkout");
    } catch (error) {
      console.error("Error during checkout:", error);
      setError("Failed to process checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add this function to handle coupon removal
  const handleRemoveCoupon = () => {
    setDiscount(0);
    setCoupon("");
    localStorage.removeItem("cartDiscount");
    localStorage.removeItem("cartCoupon");
    setShowSuggestions(true);
  };

  const handleQuantityChange = (cartItemId, change) => {
    const updatedCart = cart.map((item) => {
      if (item.cartItemId === cartItemId) {
        if (item.type === "rent") {
          const newDays = Math.max(1, (parseInt(item.days) || 1) + change);
          return {
            ...item,
            days: newDays,
          };
        } else {
          const newQuantity = Math.max(
            1,
            (parseInt(item.quantity) || 1) + change
          );
          return {
            ...item,
            quantity: newQuantity,
          };
        }
      }
      return item;
    });

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    // Clear discount when quantity changes
    setDiscount(0);
    setCoupon("");
    localStorage.removeItem("cartDiscount");
    localStorage.removeItem("cartCoupon");
  };

  // Animation variants
  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    closed: {
      x: "100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  if (!isClient) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          {/* Cart sidebar */}
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            className="fixed right-0 top-0 h-full w-full md:w-[400px] lg:w-[450px] bg-white shadow-2xl z-50 overflow-y-auto"
          >
            {/* Cart content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={itemVariants}
              className="p-4"
            >
              <motion.button
                onClick={onClose}
                className="absolute top-4 right-4 text-xl text-gray-800 hover:text-red-500 transition-colors duration-300 p-2 rounded-full hover:bg-gray-100"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FiX />
              </motion.button>

              <div className="flex items-center gap-2 mb-4 border-b pb-3">
                <FiShoppingCart className="text-xl text-gray-800" />
                <h1 className="text-xl font-bold text-[#222]">Your Cart</h1>
              </div>

              <AnimatePresence>
                {cart.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-32 text-center"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <FiShoppingCart className="text-4xl text-gray-300 mb-3" />
                    </motion.div>
                    <p className="text-[#444]">Your cart is empty</p>
                  </motion.div>
                ) : (
                  <motion.div className="space-y-3">
                    <AnimatePresence>
                      {cart.map((item, i) => (
                        <motion.div
                          key={item.cartItemId}
                          custom={i}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          layout
                          className="group flex items-center justify-between bg-gray-50 p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-transparent hover:border-gray-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative overflow-hidden rounded-lg w-16 h-16">
                              <Image
                                src={item.imageUrl}
                                alt={item.name || "Product"}
                                width={64}
                                height={64}
                                className="rounded-lg object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            </div>
                            <div>
                              <h3 className="text-base font-semibold text-[#222] group-hover:text-indigo-600 transition-colors">
                                {item.name || "Unnamed Item"}
                              </h3>
                              {item.type === "buy" ? (
                                <p className="text-sm text-[#444]">
                                  <span className="font-medium">
                                    Buy Price:
                                  </span>{" "}
                                  <span className="text-indigo-600">
                                    ₹{item.buyPrice || 0}
                                  </span>
                                </p>
                              ) : (
                                <>
                                  <p className="text-sm text-[#444]">
                                    <span className="font-medium">Rent:</span>{" "}
                                    <span className="text-indigo-600">
                                      ₹{item.rentPrice || 0}
                                    </span>
                                    /day
                                  </p>
                                  <p className="text-sm text-[#444]">
                                    <span className="font-medium">
                                      Deposit:
                                    </span>{" "}
                                    <span className="text-indigo-600">
                                      ₹{parseInt(item.deposit) || 0}
                                    </span>
                                  </p>
                                  <p className="text-sm text-[#444]">
                                    <span className="font-medium">Days:</span>{" "}
                                    {item.days || 1}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            {item.type === "rent" && (
                              <div className="flex items-center border rounded-lg overflow-hidden">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() =>
                                    handleQuantityChange(item.cartItemId, -1)
                                  }
                                  disabled={parseInt(item.days) <= 1}
                                  className="p-1 text-[#222] hover:bg-gray-100 disabled:opacity-50"
                                >
                                  <FiMinusCircle />
                                </motion.button>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.days || 1}
                                  onChange={(e) =>
                                    handleQuantityChange(
                                      item.cartItemId,
                                      parseInt(e.target.value) -
                                        (item.days || 1)
                                    )
                                  }
                                  className="border-x p-1 w-10 text-[#222] text-center focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() =>
                                    handleQuantityChange(item.cartItemId, 1)
                                  }
                                  className="p-1 text-[#222] hover:bg-gray-100"
                                >
                                  <FiPlusCircle />
                                </motion.button>
                              </div>
                            )}
                            <motion.button
                              onClick={() => removeFromCart(item.cartItemId)}
                              className="text-red-500 text-xs hover:text-red-700 transition-colors duration-300 group-hover:underline"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Remove
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Product Suggestions Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4"
                    >
                      <h2 className="text-lg font-semibold text-[#222] mb-3">
                        Suggested Products
                      </h2>
                      <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        {suggestions.map((suggestion) => (
                          <motion.div
                            key={suggestion.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex-shrink-0 w-24 bg-gray-50 p-2 rounded-lg shadow-sm"
                          >
                            <Image
                              src={suggestion.image}
                              alt={suggestion.name}
                              width={48}
                              height={48}
                              className="rounded-md mx-auto mb-1"
                            />
                            <div className="text-center">
                              <p className="text-[#222] font-medium text-xs truncate">
                                {suggestion.name}
                              </p>
                              <p className="text-[#444] text-[10px]">
                                ₹{suggestion.price}
                              </p>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => addSuggestedItem(suggestion)}
                                className="mt-1 bg-indigo-600 text-white p-1 rounded-full mx-auto flex"
                              >
                                <FiPlus size={12} />
                              </motion.button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Coupon Section with Available Offers */}
                    {cart.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-sm"
                      >
                        <h2 className="text-lg font-semibold text-[#222] border-b pb-2">
                          Apply Coupon
                        </h2>
                        <div className="mt-2">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <input
                                type="text"
                                value={coupon}
                                onChange={(e) =>
                                  setCoupon(e.target.value.toUpperCase())
                                }
                                placeholder="Enter coupon code (e.g., SAVE10)"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-500 text-sm"
                              />
                            </div>
                            <button
                              onClick={handleCouponSubmit}
                              disabled={discount > 0}
                              className="ml-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                            >
                              Apply
                            </button>
                          </div>
                          {error && (
                            <div className="mt-2 text-red-600 text-xs">
                              {error}
                            </div>
                          )}
                          {successMessage && (
                            <div className="mt-2 text-green-600 text-xs">
                              {successMessage}
                            </div>
                          )}
                          {discount > 0 && (
                            <div className="mt-2 flex items-center justify-between text-green-600 text-sm">
                              <span>Coupon applied: {discount}%</span>
                              <button
                                onClick={handleRemoveCoupon}
                                className="text-xs hover:text-red-600"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="mt-3">
                          <h3 className="text-sm font-medium text-[#222] mb-2">
                            Available Coupons:
                          </h3>
                          <div className="space-y-1">
                            {offers.map((offer, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between text-xs p-2 rounded-lg bg-white"
                              >
                                <div className="flex items-center">
                                  <span className="text-[#444]">
                                    {offer.code} - {offer.discount}% off on
                                    orders above ₹
                                    {offer.threshold.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Cart Summary */}
                    {cart.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-sm"
                      >
                        <h2 className="text-lg font-semibold text-[#222] border-b pb-2">
                          Cart Summary
                        </h2>
                        <div className="mt-2 space-y-1">
                          <p className="flex justify-between text-sm text-[#444]">
                            <span>Subtotal:</span>
                            <span className="font-medium">
                              ₹{priceDetails.subtotal.toLocaleString()}
                            </span>
                          </p>
                          {priceDetails.discount > 0 && (
                            <p className="flex justify-between text-sm text-[#444]">
                              <span>Discount ({priceDetails.discount}%):</span>
                              <span className="font-medium text-green-500">
                                -₹{priceDetails.discountAmount.toLocaleString()}
                              </span>
                            </p>
                          )}
                          <p className="flex justify-between text-sm text-[#444]">
                            <span>GST (18%):</span>
                            <span className="font-medium">
                              ₹{priceDetails.gst.toLocaleString()}
                            </span>
                          </p>
                          <hr className="my-2 border-gray-300" />
                          <h3 className="flex justify-between text-base font-bold text-[#222] py-1">
                            <span>Total:</span>
                            <span className="text-indigo-600">
                              ₹{priceDetails.total.toLocaleString()}
                            </span>
                          </h3>
                        </div>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7 }}
                          className="mt-3"
                        >
                          <button
                            onClick={handleCheckout}
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-2 px-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
                          >
                            {loading ? "Processing..." : "Proceed to Checkout"}
                          </button>
                        </motion.div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Cart;
