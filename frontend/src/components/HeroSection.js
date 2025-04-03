"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const text = "Find Your Perfect Pet Companion!";
const particleCount = 50;

const HeroSection = () => {
  const [headline, setHeadline] = useState("");
  const [index, setIndex] = useState(0);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [particles, setParticles] = useState([]);

  // Initialize particles
  useEffect(() => {
    const newParticles = [];
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 1 + 0.5,
      });
    }
    setParticles(newParticles);
  }, []);

  // Typing Effect with controlled updates
  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setHeadline((prev) => prev + text[index]);
        setIndex(index + 1);
      }, 80);
      return () => clearTimeout(timeout);
    } else {
      // Set typing as complete only after the full text has been shown
      setIsTypingComplete(true);
    }
  }, [index]);

  return (
    <section className="relative w-full h-[600px] md:h-[700px] overflow-hidden flex items-center justify-center bg-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Dynamic Gradient BG */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-800 to-rose-800"
          animate={{
            background: [
              "linear-gradient(to bottom right, #4338CA, #6D28D9, #BE185D)",
              "linear-gradient(to bottom right, #1E40AF, #7E22CE, #9D174D)",
              "linear-gradient(to bottom right, #3730A3, #5B21B6, #BE185D)",
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
        >
          {/* Particle Effect */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full bg-white opacity-60"
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                left: `${particle.x}%`,
                top: `${particle.y}%`,
              }}
              animate={{
                y: [0, -700],
                opacity: [0.6, 0]
              }}
              transition={{
                duration: particle.speed * 15,
                repeat: Infinity,
                ease: "linear",
                delay: particle.id * 0.1 % 5
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* Mesh Overlay */}
      <div 
        className="absolute inset-0 opacity-10" 
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0z' fill='none'/%3E%3Cpath d='M0 0h1v1H0zM4 4h1v1H4zM8 8h1v1H8zM12 12h1v1h-1zM16 16h1v1h-1z' fill='white'/%3E%3C/svg%3E\")",
          backgroundSize: "30px 30px"
        }}
      />

      {/* Hero Content Container */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
        {/* 3D Floating Card Effect */}
        <motion.div
          className="p-8 rounded-2xl backdrop-blur-sm bg-black/20 border border-white/10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          whileHover={{ scale: 1.02, rotateX: 5, rotateY: 5 }}
          style={{ 
            transformStyle: "preserve-3d",
            perspective: "1000px" 
          }}
        >
          {/* Smooth Typing Effect with 3D Transform */}
          <motion.h1
            className="text-white text-5xl md:text-6xl lg:text-7xl font-extrabold drop-shadow-lg"
            style={{ 
              textShadow: "0 10px 30px rgba(0,0,0,0.5)",
              transform: "translateZ(20px)" 
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {headline}
            <motion.span 
              className="text-yellow-300"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              |
            </motion.span>
          </motion.h1>

          {/* Subtitle with Glow Effect - Only appears after typing is complete */}
          <AnimatePresence>
            {isTypingComplete && (
              <motion.p
                className="text-white text-lg md:text-2xl mt-6 max-w-2xl mx-auto opacity-90 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                style={{ 
                  textShadow: "0 0 15px rgba(255,255,255,0.5)",
                  transform: "translateZ(10px)" 
                }}
              >
                Rent, love, and experience the joy of pet companionship today.
              </motion.p>
            )}
          </AnimatePresence>

          {/* CTA Buttons - Only appear after typing is complete */}
          <AnimatePresence>
            {isTypingComplete && (
              <motion.div
                className="mt-8 flex flex-col md:flex-row gap-4 md:gap-6 justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ transform: "translateZ(30px)" }}
              >
                {/* Primary CTA with Glow Effect */}
                <Link href="/rent">
                  <motion.div 
                    className="relative group overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-lg blur-md opacity-70 group-hover:opacity-100 transition duration-300" />
                    <div className="relative bg-gradient-to-r from-yellow-500 to-amber-500 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold">
                      <span className="relative z-10 flex items-center gap-2">
                        <span>Rent Now</span>
                        <motion.span
                          animate={{ x: [0, 5, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                          🐾
                        </motion.span>
                      </span>
                      <motion.div 
                        className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                        whileHover={{ 
                          opacity: [0, 0.2, 0],
                          transition: { repeat: Infinity, duration: 1 }
                        }}
                      />
                    </div>
                  </motion.div>
                </Link>

                {/* Secondary CTA with Border Animation */}
                <Link href="/pets">
                  <motion.div 
                    className="relative group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-lg opacity-0 group-hover:opacity-100 blur-sm transition duration-300" />
                    <div className="relative bg-white/10 backdrop-blur-md text-white border border-white/30 px-8 py-4 rounded-lg text-lg font-semibold group-hover:text-white/90">
                      <span className="relative z-10 flex items-center gap-2">
                        <span>Browse Pets</span>
                        <motion.span
                          animate={{ rotate: [0, 15, 0, -15, 0] }}
                          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        >
                          🦴
                        </motion.span>
                      </span>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Floating Pattern Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: (i + 1) * 200,
                height: (i + 1) * 200,
                border: `2px solid rgba(255,255,255,${0.1 - i * 0.03})`,
                top: '50%',
                left: '50%',
                x: '-50%',
                y: '-50%',
              }}
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 20 + i * 10,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;