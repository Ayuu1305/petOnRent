import { motion } from "framer-motion";

const testimonials = [
  {
    name: "John Doe",
    image: "/images/customer1.jpg",
    review:
      "Renting a pet for the weekend was an amazing experience! The process was smooth, and the pet was well taken care of.",
  },
  {
    name: "Sarah Lee",
    image: "/images/customer2.jpg",
    review:
      "Loved the service! I had the chance to spend time with a dog before adopting one. Highly recommended!",
  },
  {
    name: "Michael Smith",
    image: "/images/customer3.jpg",
    review:
      "This platform is perfect for people who want temporary pet companionship. Will use it again!",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-gray-100 py-16 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">What Our Customers Say</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-white p-6 rounded-lg shadow-md text-center"
            >
              <img
                src={testimonial.image}
                alt={testimonial.name}
                className="w-16 h-16 mx-auto rounded-full mb-4"
              />
              <p className="text-gray-600 italic mb-3">"{testimonial.review}"</p>
              <h4 className="text-lg font-semibold text-gray-800">{testimonial.name}</h4>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
