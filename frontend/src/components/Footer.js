import Link from "next/link";
import { motion } from "framer-motion";
import { FaFacebook, FaTwitter, FaInstagram, FaEnvelope, FaPhone } from "react-icons/fa";

const Footer = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const socialHoverVariants = {
    hover: {
      y: -5,
      scale: 1.2,
      rotate: [0, 10, -10, 0],
      transition: {
        duration: 0.3,
        rotate: {
          repeat: 0,
          duration: 0.5
        }
      }
    }
  };

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      
      <motion.div 
        className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {/* About Us Section */}
        <motion.div 
          variants={itemVariants}
          className="group perspective-1000"
        >
          <div className="transform-gpu transition-all duration-300 group-hover:scale-105">
            <h3 className="text-xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">About Us</h3>
            <p className="text-gray-400 transform-gpu transition-all duration-300 group-hover:text-gray-200">
              We provide the best pet rental services, allowing you to experience 
              the joy of pet companionship without long-term commitments.
            </p>
          </div>
        </motion.div>

        {/* Quick Links Section */}
        <motion.div variants={itemVariants}>
          <h3 className="text-xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">Quick Links</h3>
          <ul className="space-y-2">
            {['Home', 'Categories', 'Featured Pets', 'Contact Us'].map((item, index) => (
              <motion.li 
                key={item}
                whileHover={{ x: 5, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Link 
                  href={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`}
                  className="text-gray-400 hover:text-white transition-all duration-300 relative block
                            before:content-[''] before:absolute before:-bottom-1 before:left-0 
                            before:w-0 before:h-0.5 before:rounded-full before:opacity-0
                            before:transition-all before:duration-300 before:bg-gradient-to-r 
                            before:from-white before:to-gray-300
                            hover:before:w-full hover:before:opacity-100"
                >
                  {item}
                </Link>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Newsletter Section */}
        <motion.div variants={itemVariants}>
          <h3 className="text-xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">Subscribe to Our Newsletter</h3>
          <p className="text-gray-400 mb-3">Get the latest pet rental updates & offers.</p>
          <motion.div 
            className="flex group perspective-1000"
            whileHover={{ scale: 1.02 }}
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="p-2 rounded-l w-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-600 transition-all duration-300"
            />
            <motion.button 
              className="bg-gray-700 px-4 py-2 rounded-r relative overflow-hidden group-hover:bg-gray-600 transition-all duration-300"
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">Subscribe</span>
              <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Contact & Social Media Section */}
        <motion.div variants={itemVariants}>
          <h3 className="text-xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">Contact Us</h3>
          <motion.p 
            className="flex items-center space-x-2 text-gray-400 group"
            whileHover={{ x: 5 }}
          >
            <FaPhone className="text-lg transform-gpu transition-transform duration-300 group-hover:rotate-12" /> 
            <span className="group-hover:text-white transition-colors duration-300">+91 98765 43210</span>
          </motion.p>
          <motion.p 
            className="flex items-center space-x-2 text-gray-400 mt-2 group"
            whileHover={{ x: 5 }}
          >
            <FaEnvelope className="text-lg transform-gpu transition-transform duration-300 group-hover:rotate-12" /> 
            <span className="group-hover:text-white transition-colors duration-300">support@petonrent.com</span>
          </motion.p>
          
          <h3 className="text-xl font-bold mt-4 mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">Follow Us</h3>
          <div className="flex space-x-4">
            {[
              { Icon: FaFacebook, href: 'https://facebook.com', hoverColor: 'hover:text-blue-500' },
              { Icon: FaTwitter, href: 'https://twitter.com', hoverColor: 'hover:text-blue-400' },
              { Icon: FaInstagram, href: 'https://instagram.com', hoverColor: 'hover:text-pink-500' }
            ].map(({ Icon, href, hoverColor }) => (
              <motion.div
                key={href}
                whileHover="hover"
                variants={socialHoverVariants}
              >
                <Link 
                  href={href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`text-gray-400 ${hoverColor} transition-colors duration-300 transform-gpu`}
                >
                  <Icon className="text-2xl filter drop-shadow-lg" />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Copyright Section */}
      <motion.div 
        className="border-t border-gray-700 mt-6 pt-4 text-center relative z-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-gray-400 group perspective-1000">
          <span className="inline-block transform-gpu transition-all duration-300 group-hover:scale-105">
            © {new Date().getFullYear()} PetOnRent. All rights reserved.
          </span>
        </p>
      </motion.div>
    </footer>
  );
};

export default Footer;