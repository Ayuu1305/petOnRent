import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";

const PetManagement = () => {
  const [pets, setPets] = useState([]);
  const router = useRouter();

  // Fetch all pets
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/admin/pets");
        setPets(data);
      } catch (error) {
        console.error("Error fetching pets:", error);
      }
    };
    fetchPets();
  }, []);

  // Handle Delete
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this pet?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`http://localhost:5000/api/admin/pets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPets(pets.filter((pet) => pet._id !== id)); // Remove from UI
    } catch (error) {
      console.error("Error deleting pet:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Pets</h1>
      <button
        onClick={() => router.push("/admin/add-pet")}
        className="bg-green-600 text-white px-4 py-2 mb-4"
      >
        Add New Pet
      </button>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Image</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Category</th>
              <th className="border p-2">Rent Price</th>
              <th className="border p-2">Buy Price</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pets.map((pet) => (
              <tr key={pet._id} className="text-center">
                <td className="border p-2">
                  <img src={pet.imageUrl} alt={pet.name} className="w-16 h-16 object-cover" />
                </td>
                <td className="border p-2">{pet.name}</td>
                <td className="border p-2">{pet.category}</td>
                <td className="border p-2">₹{pet.rentPrice}</td>
                <td className="border p-2">₹{pet.buyPrice}</td>
                <td className="border p-2">
                  <button
                    onClick={() => router.push(`/admin/edit-pet?id=${pet._id}`)}
                    className="bg-blue-500 text-white px-3 py-1 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(pet._id)}
                    className="bg-red-600 text-white px-3 py-1"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PetManagement;
