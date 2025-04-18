import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { motion } from "framer-motion";
import { API_URL } from "../../utils/api";

export default function EditPet() {
  const router = useRouter();
  const { id } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pet, setPet] = useState({
    name: "",
    category: "",
    description: "",
    color: "",
    rentPrice: "",
    buyPrice: "",
    deposit: "",
    imageUrl: "",
  });

  useEffect(() => {
    const fetchPet = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem("adminToken");
        
        // Fetch the single pet using the correct endpoint
        const response = await axios.get(`${API_URL}/admin/pets/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Check if we got data back
        if (response.data) {
          setPet(response.data);
        } else {
          throw new Error("No pet data received");
        }
      } catch (error) {
        console.error("Error fetching pet:", error);
        setError(
          error.response?.data?.error || 
          error.response?.data?.message || 
          "Failed to fetch pet details"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPet();
    }
  }, [id]);

  const handleChange = (e) => {
    const value =
      e.target.type === "number" ? Number(e.target.value) : e.target.value;
      
    setPet((prev) => ({
      ...prev,
      [e.target.name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError(null);
      const token = localStorage.getItem("adminToken");
      
      // Log the request details for debugging
      console.log("Submitting to:", `${API_URL}/admin/pets/${id}`);
      console.log("Pet data:", pet);
      console.log("Token:", token ? "Present" : "Missing");
  
      // Update the pet
      const response = await axios.put(`${API_URL}/admin/pets/${id}`, pet, {
          headers: { 
            Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          },
      });
  
      if (response.data) {
        router.push("/admin");
      }
    } catch (error) {
      console.error("Full error object:", error);
      console.error("Response data:", error.response?.data);
      console.error("Status code:", error.response?.status);
      
      setError(
        error.response?.data?.error || 
        error.response?.data?.message || 
          `Failed to update pet (Status: ${
            error.response?.status || "unknown"
          })`
      );
    }
  };
  
  // ... rest of the component remains the same ...
  
  // Return loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl text-gray-600"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  // Return error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl text-red-600 text-center p-4"
        >
          <p>{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/admin")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Admin
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto bg-white rounded-lg shadow-2xl p-8"
      >
        <motion.h2 
          className="text-3xl font-bold text-center text-gray-800 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Edit Pet
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
          ].map((field) => (
            <motion.div
              key={field.name}
              whileHover={{ scale: 1.02 }}
              className="w-full"
            >
              {field.type === "select" ? (
                <select
                  name={field.name}
                  value={pet[field.name] || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-black bg-white"
                >
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  name={field.name}
                  placeholder={field.placeholder}
                  type={field.type}
                  value={pet[field.name] || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-black placeholder-gray-500"
                  required
                />
              )}
            </motion.div>
          ))}
          <div className="flex space-x-4">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/admin")}
              className="w-1/2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-1/2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Save Changes
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
