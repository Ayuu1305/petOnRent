"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../../context/CartContext";
import axios from "axios";

const PetDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const { updateCartCount } = useCart();

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rentalDays, setRentalDays] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    if (id) {
      const fetchPetDetails = async () => {
        try {
          const { data } = await axios.get(`http://localhost:5000/api/pets/${id}`);
          setPet(data);
        } catch (error) {
          console.error("Error fetching pet details:", error);
          setError("Failed to fetch pet details.");
        } finally {
          setLoading(false);
        }
      };
      fetchPetDetails();
    }
  }, [id]);

  useEffect(() => {
    if (rentalDays && fromDate) {
      const startDate = new Date(fromDate);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + parseInt(rentalDays, 10));
      setToDate(endDate.toISOString().split("T")[0]);
    } else {
      setToDate("");
    }
  }, [rentalDays, fromDate]);

  const handleRentalDaysChange = (e) => setRentalDays(e.target.value);
  const handleFromDateChange = (e) => setFromDate(e.target.value);

  const handleAddToCart = () => {
    if (!pet) return;

    const deliveryCharges = 200;
    const totalAmount = pet.rentPrice * rentalDays + pet.deposit + deliveryCharges;

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    cart.push({
      id: `${pet._id}-${Date.now()}`,
      petId: pet._id,
      name: pet.name,
      imageUrl: pet.imageUrl, // Updated to match API field
      rentPrice: pet.rentPrice,
      deposit: pet.deposit,
      days: rentalDays,
      fromDate,
      toDate,
      totalAmount,
      type: "rent",
      category: pet.category // Added to differentiate from buy
    });

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount(cart.length);
    router.push("/pets");
  };

  const handleBuyNow = () => {
    if (!pet) return;

    const gstRate = 0.12; // 12% GST
    const basePrice = pet.buyPrice;
    const gstAmount = basePrice * gstRate;
    const totalAmount = basePrice + gstAmount; // No deposit, only GST

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    cart.push({
      id: `${pet._id}-${Date.now()}`,
      petId: pet._id,
      name: pet.name,
      imageUrl: pet.imageUrl,
      buyPrice: pet.buyPrice,
      totalAmount,
      type: "buy", // Differentiate as a buy item
    });

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount(cart.length);
    router.push("/pets");
  };

  if (loading) return <p className="text-center text-lg">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!pet) return <p className="text-center text-lg">Pet not found.</p>;

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen flex justify-center items-center p-4">
      <motion.div
        className="container mx-auto p-6 bg-white shadow-xl rounded-2xl max-w-4xl transform-style-preserve-3d hover:shadow-2xl transition-all duration-500"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6 transform-style-preserve-3d">
          {/* Image Section */}
          <motion.div
            className="w-full flex justify-center transform-style-preserve-3d"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="relative w-full h-[400px] rounded-xl overflow-hidden shadow-lg transform-style-preserve-3d">
              <Image
                src={pet.imageUrl}
                alt={pet.name}
                fill
                className="object-cover rounded-xl transition-transform duration-500 hover:scale-105"
                style={{ transformStyle: "preserve-3d" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
            </div>
          </motion.div>

          {/* Details Section */}
          <motion.div className="w-full transform-style-preserve-3d">
            <motion.div
              className="bg-gray-50 p-4 rounded-xl shadow-sm transform-style-preserve-3d hover:shadow-md transition-all duration-300 mb-4"
              whileHover={{ scale: 1.01, translateZ: "20px" }}
            >
              <h1 className="text-2xl font-bold text-black">{pet.name}</h1>
              <p className="text-lg mt-1 text-black">Security Deposit: <span className="font-semibold">₹{pet.deposit}</span></p>
              <p className="text-lg mt-1 text-black">Rent Price: <span className="font-semibold">₹{pet.rentPrice}/day</span></p>
              <p className="text-lg mt-1 text-black">Buy Price: <span className="font-semibold">₹{pet.buyPrice}</span></p>
              <p className="text-lg mt-1 text-black">Color: <span className="font-semibold">{pet.color}</span></p>
            </motion.div>

            {!pet.available && (
              <motion.p
                className="text-red-500 font-semibold text-center mb-4"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Currently Not Available
              </motion.p>
            )}

            {/* Rental Details */}
            <motion.div
              className="bg-gray-50 p-4 rounded-xl shadow-sm transform-style-preserve-3d hover:shadow-md transition-all duration-300 mb-4 min-h-[250px]"
            >
              <div className="space-y-3">
                <div>
                  <label className="text-lg font-semibold text-black block mb-1">Rental Duration</label>
                  <motion.input
                    type="number"
                    className="w-full border-2 border-gray-200 p-2 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 text-black"
                    placeholder="Enter number of days"
                    value={rentalDays}
                    onChange={handleRentalDaysChange}
                    min="1"
                    whileFocus={{ scale: 1.02 }}
                  />
                </div>
                <div>
                  <label className="text-lg font-semibold text-black block mb-1">From Date</label>
                  <motion.input
                    type="date"
                    className="w-full border-2 border-gray-200 p-2 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 text-black"
                    value={fromDate}
                    onChange={handleFromDateChange}
                    disabled={!rentalDays}
                    whileFocus={{ scale: 1.02 }}
                  />
                </div>
                <div className="h-[50px] flex items-center">
                  <AnimatePresence>
                    {toDate && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-gray-100 p-3 rounded-lg w-full"
                      >
                        <p className="text-lg text-black">
                          To Date: <span className="font-semibold">{toDate}</span>
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* Buttons */}
            <div className="flex flex-col gap-4">
              <motion.button
                className="w-full bg-black text-white py-3 rounded-xl text-lg font-semibold transform-style-preserve-3d hover:shadow-xl transition-all duration-300"
                disabled={!pet.available || !fromDate || !rentalDays}
                onClick={handleAddToCart}
                whileHover={{ scale: 1.02, translateZ: "30px" }}
                whileTap={{ scale: 0.98 }}
                style={{ background: "linear-gradient(45deg, #000, #333)" }}
              >
                Rent Now
              </motion.button>

              <motion.button
                className="w-full bg-green-600 text-white py-3 rounded-xl text-lg font-semibold transform-style-preserve-3d hover:shadow-xl transition-all duration-300"
                disabled={!pet.available}
                onClick={handleBuyNow}
                whileHover={{ scale: 1.02, translateZ: "30px" }}
                whileTap={{ scale: 0.98 }}
                style={{ background: "linear-gradient(45deg, #16a34a, #22c55e)" }}
              >
                Buy Now
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PetDetails;