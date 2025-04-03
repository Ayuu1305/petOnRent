"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import axios from "axios";
import { API_URL } from "../../utils/api";

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

  useEffect(() => {
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

    fetchPets();
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
            {filteredPets.map((pet) => (
              <div
                key={pet._id}
                className="bg-white shadow-lg rounded-lg p-4 transition-transform hover:scale-105 cursor-pointer"
                onClick={() => router.push(`/pets/${pet._id}`)}
              >
                <div className="w-full h-48 rounded-lg overflow-hidden">
                  <Image
                    src={pet.imageUrl}
                    alt={pet.name}
                    width={300}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-semibold mt-2 text-black">
                  {pet.name}
                </h3>
                <p className="text-sm text-gray-600">{pet.description}</p>
                <p className="font-bold mt-1 text-black">
                  Rent: ₹{pet.rentPrice}/day
                </p>
                <p className="font-bold mt-1 text-black">
                  Buy: ₹{pet.buyPrice}
                </p>
                <div className="mt-2">
                  <StarRating rating={pet.averageRating || 0} />
                  <span className="text-xs text-gray-500 ml-2">
                    ({pet.reviews?.length || 0} reviews)
                  </span>
                </div>
                {!pet.available && (
                  <p className="text-red-500 font-semibold">
                    Currently Not Available
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PetListing;
