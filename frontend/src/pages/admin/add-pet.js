import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { motion } from "framer-motion";
import { API_URL } from "../../utils/api";

export default function AddPet() {
  const router = useRouter();
  const [pet, setPet] = useState({
    name: "",
    category: "dog",
    description: "",
    color: "",
    rentPrice: "",
    buyPrice: "",
    deposit: "",
    imageUrl: "",
  });

  const handleChange = (e) => {
    setPet({ ...pet, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(`${API_URL}/admin/add`, pet, {
        headers: { Authorization: `Bearer ${token}` },
      });
      router.push("/admin");
    } catch (error) {
      console.error("Error adding pet:", error);
    }
  };

  const inputVariants = {
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 },
    },
    focus: {
      scale: 1.02,
      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.5)",
      transition: { duration: 0.2 },
    },
  };

  const formVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={formVariants}
        className="max-w-2xl mx-auto bg-white rounded-lg shadow-2xl p-8"
      >
        <motion.h2
          className="text-3xl font-bold text-center text-gray-800 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Add New Pet
        </motion.h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {[
            { name: "name", placeholder: "Pet Name", type: "text" },
            {
              name: "category",
              type: "select",
              options: ["dog", "cat", "bird"],
            },
            { name: "description", placeholder: "Description", type: "text" },
            { name: "color", placeholder: "Color", type: "text" },
            { name: "rentPrice", placeholder: "Rent Price", type: "number" },
            { name: "buyPrice", placeholder: "Buy Price", type: "number" },
            { name: "deposit", placeholder: "Deposit", type: "number" },
            { name: "imageUrl", placeholder: "Image URL", type: "text" },
          ].map((field, index) => (
            <motion.div
              key={field.name}
              variants={formVariants}
              whileHover="hover"
              whileFocus="focus"
            >
              {field.type === "select" ? (
                <motion.select
                  name={field.name}
                  onChange={handleChange}
                  variants={inputVariants}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-black bg-white"
                >
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </motion.select>
              ) : (
                <motion.input
                  name={field.name}
                  placeholder={field.placeholder}
                  type={field.type}
                  onChange={handleChange}
                  variants={inputVariants}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-black placeholder-gray-500"
                  required
                />
              )}
            </motion.div>
          ))}
          <motion.button
            type="submit"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Add Pet
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
