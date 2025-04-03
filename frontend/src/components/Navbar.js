"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiMenu,
  FiX,
  FiShoppingCart,
  FiSearch,
  FiUser,
  FiHome,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import dynamic from "next/dynamic";
import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react";

// Lazy load Cart component (better performance)
const Cart = dynamic(() => import("./Cart"), { ssr: false });

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { cartCount, updateCartCount } = useCart();
  const router = useRouter();

  const { user, logout } = useAuth();

  // Load cart count from localStorage on mount
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    updateCartCount(cart.length);
  }, [updateCartCount]);

  // Scroll to categories or navigate to home first
  const scrollToCategories = (e) => {
    e.preventDefault();
    if (router.pathname === "/") {
      document
        .getElementById("pet-categories")
        ?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/#pet-categories");
    }
  };

  const handleNavigation = (path) => {
    router.push(path);
    setMenuOpen(false);
  };

  const handleCartClick = (e) => {
    e.preventDefault(); // Prevent default navigation
    setCartOpen(true);
  };

  return (
    <>
      {/* Navbar */}
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/90 backdrop-blur-md shadow-lg p-4 fixed w-full top-0 z-50 font-sans"
      >
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo with 3D effect */}
          <div
            className="flex items-center space-x-2 group cursor-pointer"
            onClick={() => handleNavigation("/")}
          >
            <motion.div
              whileHover={{
                scale: 1.05,
                transition: { type: "spring", stiffness: 300 },
              }}
            >
              <span className="text-2xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors duration-300 relative">
                PetOnRent
                <motion.span
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [0, 10, 0, -10, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="inline-block ml-1"
                >
                  🐾
                </motion.span>
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"></div>
              </span>
            </motion.div>
          </div>

          {/* Search Bar with glow effect */}
          <div className="hidden md:flex items-center bg-gray-100 px-4 py-2 rounded-full transition-all duration-300 hover:shadow-md hover:bg-white group focus-within:ring-2 focus-within:ring-indigo-300 focus-within:bg-white">
            <FiSearch className="text-gray-500 mr-2 group-hover:text-indigo-500 transition-colors duration-300" />
            <input
              type="text"
              placeholder="Search pets..."
              className="bg-transparent outline-none w-40 text-gray-700 transition-all duration-300 focus:w-48"
            />
          </div>

          {/* Navbar Links with hover effects */}
          <div className="hidden md:flex space-x-8 text-lg font-medium tracking-wide">
            <motion.div
              whileHover={{
                scale: 1.1,
                transition: { type: "spring", stiffness: 300 },
              }}
              className="relative overflow-hidden group cursor-pointer"
              onClick={() => handleNavigation("/")}
            >
              <span className="text-gray-800 group-hover:text-indigo-600 transition-colors duration-300">
                Home
              </span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"></div>
            </motion.div>
            <motion.div
              whileHover={{
                scale: 1.1,
                transition: { type: "spring", stiffness: 300 },
              }}
              className="relative overflow-hidden group cursor-pointer"
              onClick={scrollToCategories}
            >
              <span className="text-gray-800 group-hover:text-indigo-600 transition-colors duration-300">
                Categories
              </span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"></div>
            </motion.div>
            <motion.div
              whileHover={{
                scale: 1.1,
                transition: { type: "spring", stiffness: 300 },
              }}
              className="relative overflow-hidden group cursor-pointer"
              onClick={() => handleNavigation("/pets")}
            >
              <span className="text-gray-800 group-hover:text-indigo-600 transition-colors duration-300">
                Pets
              </span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"></div>
            </motion.div>
            {user && (
              <>
                <motion.div
                  whileHover={{
                    scale: 1.1,
                    transition: { type: "spring", stiffness: 300 },
                  }}
                  className="relative overflow-hidden group cursor-pointer"
                  onClick={() => handleNavigation("/appointments")}
                >
                  <span className="text-gray-800 group-hover:text-indigo-600 transition-colors duration-300">
                    Vet Appointments
                  </span>
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"></div>
                </motion.div>
                <motion.div
                  whileHover={{
                    scale: 1.1,
                    transition: { type: "spring", stiffness: 300 },
                  }}
                  className="relative overflow-hidden group cursor-pointer"
                  onClick={() => handleNavigation("/my-insurance")}
                >
                  <span className="text-gray-800 group-hover:text-indigo-600 transition-colors duration-300">
                    Pet Insurance
                  </span>
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"></div>
                </motion.div>
              </>
            )}
            <motion.div
              whileHover={{
                scale: 1.1,
                transition: { type: "spring", stiffness: 300 },
              }}
              className="relative overflow-hidden group cursor-pointer"
              onClick={() => handleNavigation("/feedback")}
            >
              <span className="text-gray-800 group-hover:text-indigo-600 transition-colors duration-300">
                Feedback
              </span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"></div>
            </motion.div>
          </div>

          {/* Right Section: Cart & User/Login/Admin */}
          <div className="flex items-center space-x-6">
            {/* Home Icon with 3D hover effect */}
            <motion.button
              className="relative"
              onClick={handleCartClick}
              whileHover={{
                scale: 1.1,
                rotate: [0, 2, 0, -2, 0],
                transition: { duration: 0.5, repeat: Infinity },
              }}
              whileTap={{ scale: 0.9 }}
            >
              <div className="relative transition-all duration-300 hover:text-indigo-600 group">
                <FiHome className="text-2xl text-gray-800 group-hover:text-indigo-600 transition-colors duration-300" />
                <div className="absolute -inset-2 bg-indigo-100 rounded-full scale-0 group-hover:scale-100 -z-10 transition-transform duration-300 opacity-0 group-hover:opacity-70"></div>
              </div>
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full shadow-md"
                >
                  {cartCount}
                </motion.span>
              )}
            </motion.button>

            {/* User/Admin Login & Logout with hover effect */}
            {user ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </motion.button>
            ) : (
              <div className="flex items-center space-x-4">
                <span
                  className="text-gray-600 hover:text-gray-800 transition-colors duration-200 cursor-pointer"
                  onClick={() => handleNavigation("/login")}
                >
                  Login
                </span>
                <span
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
                  onClick={() => handleNavigation("/signup")}
                >
                  Sign Up
                </span>
              </div>
            )}

            {/* Mobile Menu Button with smooth animation */}
            <motion.button
              className="md:hidden relative group"
              onClick={() => setMenuOpen(!menuOpen)}
              whileTap={{ scale: 0.9 }}
              initial="hidden"
              variants={{
                hidden: { rotate: 0 },
                visible: { rotate: 180 },
              }}
              animate={menuOpen ? "visible" : "hidden"}
              transition={{ duration: 0.3 }}
            >
              {menuOpen ? (
                <FiX className="text-2xl text-gray-800 group-hover:text-red-500 transition-colors duration-300" />
              ) : (
                <FiMenu className="text-2xl text-gray-800 group-hover:text-indigo-600 transition-colors duration-300" />
              )}
              <div className="absolute -inset-2 bg-gray-100 rounded-full scale-0 group-hover:scale-100 -z-10 transition-all duration-300 opacity-0 group-hover:opacity-70"></div>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu with smooth slide animation */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-white/95 backdrop-blur-sm shadow-lg rounded-b-lg overflow-hidden"
            >
              <div className="flex flex-col space-y-3 p-4">
                <div
                  className="text-gray-800 hover:text-indigo-600 transition-colors duration-300 py-2 px-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                  onClick={() => handleNavigation("/")}
                >
                  Home
                </div>
                <div
                  className="text-gray-800 hover:text-indigo-600 transition-colors duration-300 py-2 px-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                  onClick={(e) => {
                    scrollToCategories(e);
                    setMenuOpen(false);
                  }}
                >
                  Categories
                </div>
                <div
                  className="text-gray-800 hover:text-indigo-600 transition-colors duration-300 py-2 px-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                  onClick={() => handleNavigation("/pets")}
                >
                  Pets
                </div>
                {user && (
                  <>
                    <div
                      className="text-gray-800 hover:text-indigo-600 transition-colors duration-300 py-2 px-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                      onClick={() => handleNavigation("/appointments")}
                    >
                      Vet Appointments
                    </div>
                    <div
                      className="text-gray-800 hover:text-indigo-600 transition-colors duration-300 py-2 px-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                      onClick={() => handleNavigation("/my-insurance")}
                    >
                      Pet Insurance
                    </div>
                  </>
                )}
                <div
                  className="text-gray-800 hover:text-indigo-600 transition-colors duration-300 py-2 px-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                  onClick={() => handleNavigation("/feedback")}
                >
                  Feedback
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Cart Sidebar - Only show when cartOpen is true */}
      {cartOpen && (
        <Cart isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      )}
    </>
  );
};

export default Navbar;
