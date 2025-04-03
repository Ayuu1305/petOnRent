import { motion } from "framer-motion";
import { useRouter } from "next/router";

const CTASection = () => {
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const particleCount = 15;
  const particles = Array.from({ length: particleCount }).map((_, i) => ({
    id: i,
    size: Math.random() * 6 + 2,
    delay: Math.random() * 2,
    duration: Math.random() * 5 + 3,
  }));

  const handleGetStarted = () => {
    router.push("/pets");
  };

  return (
    <div className="w-full perspective-990">
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative p-2 md:p-16 bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-center overflow-hidden transform-gpu transition-all duration-300 hover:shadow-blue-500/50 z-10"
        style={{
          transformStyle: "preserve-3d",
          backfaceVisibility: "hidden",
        }}
        whileHover={{
          scale: 1.02,
          transition: { duration: 0.4 },
        }}
      >
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-white opacity-50"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -80, -160],
              x: [0, Math.random() * 40 - 20, Math.random() * 60 - 30],
              opacity: [0.5, 0.8, 0],
              scale: [1, 1.5, 0.8],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut",
            }}
          />
        ))}

        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-300 rounded-full mix-blend-lighten filter blur-3xl opacity-30 animate-pulse"></div>
        <div
          className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-400 rounded-full mix-blend-lighten filter blur-3xl opacity-20 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

        <div className="relative z-10 max-w-5xl mx-auto">
          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold mb-6 tracking-tight relative"
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.2)" }}
          >
            <span className="relative inline-block transform-gpu transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:text-yellow-300">
              Rent Your Perfect Pet Today!
            </span>
            <motion.span
              className="inline-block ml-2"
              animate={{
                rotate: [0, 10, 0, -10, 0],
                y: [0, -3, 0, -3, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              🐾
            </motion.span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed text-blue-100"
          >
            Find a loving companion without long-term commitments. Choose from a
            variety of pets and start your journey today!
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="relative group perspective-500 inline-block"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-full blur-md opacity-70 group-hover:opacity-100 transition duration-300"></div>
            <motion.button
              onClick={handleGetStarted}
              whileHover={{
                scale: 1.05,
                backgroundColor: "#fff",
                color: "#2563eb",
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="relative bg-white text-blue-600 font-semibold px-8 py-4 rounded-full shadow-lg transition-all z-10"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <span>Get Started</span>
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  🚀
                </motion.span>
              </span>
            </motion.button>
          </motion.div>
        </div>

        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 border-4 border-blue-300/40 rounded-xl transform rotate-12 opacity-50"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-40 h-40 border-4 border-indigo-300/30 rounded-full transform-gpu opacity-40"></div>
      </motion.section>
    </div>
  );
};

export default CTASection;
