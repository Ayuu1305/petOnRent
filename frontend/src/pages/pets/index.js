"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import axios from "axios";
import { API_URL } from "../../utils/api";
import Link from "next/link";
import { motion } from "framer-motion";

// Simple star rating component
const StarRating = ({ rating }) => {
  const stars = Array(5)
    .fill(0)
    .map((_, i) => (
      <span
        key={i}
        className={i < Math.round(rating) ? "text-yellow-400" : "text-gray-300"}
      >
        ★
      </span>
    ));
  return <div className="flex">{stars}</div>;
};

const PetListing = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const fetchPets = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/pets`);
      setPets(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching pets:", error);
      setError("Failed to load pets. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  // Add event listener for review updates
  useEffect(() => {
    const handleReviewUpdate = () => {
      fetchPets();
    };

    window.addEventListener("reviewUpdated", handleReviewUpdate);
    return () => {
      window.removeEventListener("reviewUpdated", handleReviewUpdate);
    };
  }, []);

  // Set initial filter from URL query
  useEffect(() => {
    if (router.query.category) {
      // Convert the category from URL to proper case (first letter uppercase)
      const category =
        router.query.category.charAt(0).toUpperCase() +
        router.query.category.slice(1);
      setSelectedFilter(category);
    }
  }, [router.query.category]);

  const filteredPets = pets.filter(
    (pet) =>
      (selectedFilter === "All" ||
        pet.category.toLowerCase() === selectedFilter.toLowerCase()) &&
      pet.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCategoryClick = (category) => {
    setSelectedFilter(category);
    // Update URL without page reload
    router.push(
      {
        pathname: router.pathname,
        query: { category: category.toLowerCase() },
      },
      undefined,
      { shallow: true }
    );
  };

  const renderPetCard = (pet) => (
    <motion.div
      key={pet._id}
      className="bg-white rounded-xl shadow-md overflow-hidden transform-style-preserve-3d hover:shadow-xl transition-all duration-300 cursor-pointer"
      whileHover={{ scale: 1.02, translateZ: "20px" }}
      onClick={() => router.push(`/pets/${pet._id}`)}
    >
      <div className="relative h-48">
        <Image
          src={pet.imageUrl}
          alt={pet.name}
          layout="fill"
          objectFit="cover"
          className="transform hover:scale-110 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{pet.name}</h3>
        <p className="text-gray-600 mb-2 line-clamp-2">{pet.description}</p>

        {/* Rating and Reviews */}
        <div className="flex items-center mb-2">
          <div className="flex">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <span
                  key={i}
                  className={
                    i < Math.round(pet.averageRating || 0)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }
                >
                  ★
                </span>
              ))}
          </div>
          <span className="text-sm text-gray-500 ml-2">
            ({pet.reviews?.length || 0} reviews)
          </span>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="text-lg font-bold text-gray-900">
            ₹{pet.buyPrice.toLocaleString()}
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="bg-[#F9F9F9] min-h-screen p-6 pt-16">
      <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold text-center mb-6 text-black">
          Browse Pets for Rent & Buy
        </h1>

        {/* Search Bar */}
        <div className="flex justify-center mb-4">
          <input
            type="text"
            placeholder="Search pets..."
            className="border p-2 rounded w-full md:w-1/2 text-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center gap-4 mb-6">
          {["All", "Dog", "Cat", "Bird"].map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                selectedFilter === category
                  ? "bg-indigo-600 text-white shadow-lg transform scale-105"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Show Loading, Error, or Pets */}
        {loading ? (
          <p className="text-center text-gray-600">Loading pets...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : filteredPets.length === 0 ? (
          <p className="text-center text-gray-600">No pets found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredPets.map((pet) => renderPetCard(pet))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PetListing;
