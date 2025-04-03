import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";

const categories = [
  { name: "Dog", image: "/images/dog.jpeg", path: "/pets" },
  { name: "Cat", image: "/images/cat.jpeg", path: "/pets" },
  { name: "Bird", image: "/images/bird.jpg", path: "/pets" },
];

const PetCategories = () => {
  const router = useRouter();

  // Animation variants for container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  // Animation variants for each card
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      rotateX: -15,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
    hover: {
      scale: 1.05,
      rotateY: 5,
      boxShadow:
        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
  };

  // Animation variants for images
  const imageVariants = {
    hover: {
      scale: 1.1,
      transition: {
        duration: 0.3,
      },
    },
  };

  const handleCategoryClick = (category) => {
    router.push({
      pathname: category.path,
      query: { category: category.name.toLowerCase() },
    });
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-100 to-white perspective-1000">
      <div id="pet-categories" className="container mx-auto py-16 px-4">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center mb-12 text-gray-800"
        >
          Choose Your Pet Category
        </motion.h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {categories.map((category, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover="hover"
              className="bg-white rounded-xl overflow-hidden cursor-pointer transform-style-3d"
              onClick={() => handleCategoryClick(category)}
            >
              <div className="p-6">
                <div className="relative w-full h-64 md:h-72 lg:h-80 rounded-lg overflow-hidden bg-gray-200">
                  <motion.img
                    variants={imageVariants}
                    src={category.image}
                    alt={category.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => (e.target.src = "/images/placeholder.jpg")}
                  />
                </div>
                <motion.h3
                  className="mt-6 font-semibold text-2xl text-gray-700 text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  {category.name}
                </motion.h3>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PetCategories;
