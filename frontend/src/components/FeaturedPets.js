import { motion } from "framer-motion";
import { useState } from "react";

const pets = [
  { name: "Golden Retriever", price: "$50/day", image: "/images/dog.jpeg" },
  { name: "Siberian Cat", price: "$30/day", image: "/images/cat.jpeg" },
];

const FeaturedPets = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Enhanced animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0,
      rotateX: -15,
      y: 50
    },
    visible: {
      opacity: 1,
      rotateX: 0,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    },
    hover: {
      scale: 1.02,
      rotateY: 5,
      z: 50,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  return (
    <section className="p-12 bg-gradient-to-b from-gray-100 to-white perspective-1000">
      {/* Title Animation */}
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-4xl font-extrabold text-center text-black mb-10 transform-style-preserve-3d"
      >
        Featured Pets 🐾
      </motion.h2>

      {/* Pets Grid with 3D Container */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-8 transform-style-preserve-3d"
      >
        {pets.map((pet, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            whileHover="hover"
            onHoverStart={() => setHoveredIndex(index)}
            onHoverEnd={() => setHoveredIndex(null)}
            className="group relative bg-white rounded-xl overflow-hidden cursor-pointer transform-style-preserve-3d transition-all duration-300 ease-out"
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden"
            }}
          >
            {/* Card Content with 3D Effect */}
            <div className="relative p-6 transform-style-preserve-3d">
              {/* Image Container with 3D Hover */}
              <div className="relative w-full h-64 rounded-lg overflow-hidden transform-style-preserve-3d transition-transform duration-500">
                <motion.img
                  src={pet.image}
                  alt={pet.name}
                  className="absolute inset-0 w-full h-full object-cover rounded-lg transition-transform duration-500 ease-out"
                  style={{
                    transform: hoveredIndex === index ? "translateZ(20px)" : "translateZ(0)"
                  }}
                  whileHover={{ scale: 1.05 }}
                />

                {/* Enhanced 3D Badge */}
                <motion.span
                  className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg"
                  style={{
                    transform: hoveredIndex === index ? "translateZ(40px)" : "translateZ(0)",
                    transition: "transform 0.3s ease-out"
                  }}
                >
                  Most Demanding 🔥
                </motion.span>
              </div>

              {/* Pet Info with 3D Text Effect */}
              <div className="mt-4 text-center transform-style-preserve-3d">
                <motion.h3
                  className="text-2xl font-bold text-black transition-all duration-300"
                  style={{
                    transform: hoveredIndex === index ? "translateZ(30px)" : "translateZ(0)"
                  }}
                >
                  {pet.name}
                </motion.h3>
                <motion.p
                  className="text-lg font-semibold text-gray-700 transition-all duration-300"
                  style={{
                    transform: hoveredIndex === index ? "translateZ(25px)" : "translateZ(0)"
                  }}
                >
                  {pet.price}
                </motion.p>
              </div>

              {/* 3D Hover Effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none" 
                style={{
                  transform: "translateZ(10px)"
                }}
              />
            </div>

            {/* Card Shadow */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl"
              style={{
                transform: "translateZ(-1px)",
                boxShadow: hoveredIndex === index ? 
                  "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)" : 
                  "none"
              }}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default FeaturedPets;