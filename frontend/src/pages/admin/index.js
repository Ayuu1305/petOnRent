import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { motion } from "framer-motion";
import { API_URL } from "../../utils/api";

const PetManagement = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          router.push("/admin/login"); // Redirect if not logged in
          return;
        }
        const { data } = await axios.get(`${API_URL}/admin/pets`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPets(data);
      } catch (error) {
        console.error("Error fetching pets:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPets();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken"); // Remove token
    router.push("/admin/login"); // Redirect to login page
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this pet?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`${API_URL}/admin/pets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPets((prevPets) => prevPets.filter((pet) => pet._id !== id));
    } catch (error) {
      console.error("Error deleting pet:", error);
    }
  };

  if (loading)
    return (
    <div className="flex justify-center items-center min-h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl font-semibold text-gray-700"
        >
        Loading Pets...
      </motion.div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen"
    >
      {/* ✅ Admin Panel Navbar */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          Manage Pets
        </h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-medium transition-all shadow-md"
        >
          Logout
        </motion.button>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => router.push("/admin/add-pet")}
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg shadow-lg transition-colors duration-200 font-medium flex items-center gap-2"
      >
        Add New Pet
      </motion.button>

      {pets.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-500 text-lg py-12"
        >
          No pets found.
        </motion.p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-lg">
          <table className="w-full bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                  Image
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                  Rent Price
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                  Buy Price
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pets.map((pet) => (
                <motion.tr 
                  key={pet._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ backgroundColor: "#f8fafc" }}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4">
                    <img 
                      src={pet.imageUrl} 
                      alt={pet.name} 
                      className="w-16 h-16 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                    />
                  </td>
                  <td className="px-6 py-4 text-gray-800 font-medium">
                    {pet.name}
                  </td>
                  <td className="px-6 py-4 capitalize text-gray-600">
                    {pet.category}
                  </td>
                  <td className="px-6 py-4 text-gray-600">₹{pet.rentPrice}</td>
                  <td className="px-6 py-4 text-gray-600">₹{pet.buyPrice}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          router.push(`/admin/edit-pet?id=${pet._id}`)
                        }
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200 text-sm font-medium"
                      >
                        Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(pet._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors duration-200 text-sm font-medium"
                      >
                        Delete
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default PetManagement;
