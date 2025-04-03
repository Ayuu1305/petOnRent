import { useState } from "react";
import { motion } from "framer-motion";
import { Send, User, Mail, MessageSquare } from "lucide-react";

const Feedback = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add handleSubmit function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission (page refresh)
    console.log("Feedback submitted:", formData);
    // Optionally, you can add an API call here to submit the feedback
    // e.g., fetch("/api/feedback", { method: "POST", body: JSON.stringify(formData) })
    // Reset form after submission
    setFormData({ name: "", email: "", message: "" });
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center px-6 py-20">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-2xl"
      >
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            We Value Your Feedback
          </h1>
          <p className="text-gray-600 text-lg">Help us improve your experience</p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 backdrop-blur-sm backdrop-filter"
          whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)" }}
          transition={{ duration: 0.3 }}
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            <motion.div
              variants={itemVariants}
              className="relative"
              whileHover={{ scale: 1.01 }}
              animate={{
                scale: focusedField === "name" ? 1.02 : 1,
              }}
            >
              <label
                htmlFor="name" // Add htmlFor to associate with input
                className="block text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2"
              >
                <User size={20} className="text-blue-500" />
                Your Name
              </label>
              <input
                type="text"
                id="name" // Add id to match htmlFor
                name="name"
                value={formData.name}
                onChange={handleChange}
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 outline-none"
              />
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="relative"
              whileHover={{ scale: 1.01 }}
              animate={{
                scale: focusedField === "email" ? 1.02 : 1,
              }}
            >
              <label
                htmlFor="email" // Add htmlFor to associate with input
                className="block text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2"
              >
                <Mail size={20} className="text-blue-500" />
                Your Email
              </label>
              <input
                type="email"
                id="email" // Add id to match htmlFor
                name="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 outline-none"
              />
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="relative"
              whileHover={{ scale: 1.01 }}
              animate={{
                scale: focusedField === "message" ? 1.02 : 1,
              }}
            >
              <label
                htmlFor="message" // Add htmlFor to associate with textarea
                className="block text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2"
              >
                <MessageSquare size={20} className="text-blue-500" />
                Your Feedback
              </label>
              <textarea
                id="message" // Add id to match htmlFor
                name="message"
                value={formData.message}
                onChange={handleChange}
                onFocus={() => setFocusedField("message")}
                onBlur={() => setFocusedField(null)}
                placeholder="Share your thoughts..."
                rows="4"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 outline-none resize-none"
              />
            </motion.div>

            <motion.button
              type="submit" // Add type="submit" to make the button type explicit
              variants={itemVariants}
              whileHover={{
                scale: 1.03,
                boxShadow: "0 10px 20px -10px rgba(59, 130, 246, 0.5)",
              }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-4 rounded-xl text-lg shadow-lg flex items-center justify-center gap-2 group transition-all duration-300"
              aria-label="Submit feedback form" // Add aria-label for accessibility
            >
              Submit Feedback
              <Send size={20} className="transform group-hover:translate-x-1 transition-transform duration-300" />
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Feedback;