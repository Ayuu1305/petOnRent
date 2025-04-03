"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FiCheck, FiX } from "react-icons/fi";

const insurancePlans = [
  {
    id: "basic",
    name: "Basic Plan",
    price: 299,
    coverage: "Basic health coverage",
    benefits: [
      "Basic medical expenses",
      "Accident coverage",
      "24/7 vet consultation",
      "Up to ₹5,000 coverage",
    ],
  },
  {
    id: "premium",
    name: "Premium Plan",
    price: 599,
    coverage: "Comprehensive coverage",
    benefits: [
      "Full medical expenses",
      "Accident & illness coverage",
      "24/7 vet consultation",
      "Up to ₹15,000 coverage",
      "Grooming services",
      "Vaccination coverage",
    ],
  },
  {
    id: "elite",
    name: "Elite Plan",
    price: 999,
    coverage: "Complete protection",
    benefits: [
      "Full medical expenses",
      "Accident & illness coverage",
      "24/7 vet consultation",
      "Up to ₹30,000 coverage",
      "Grooming services",
      "Vaccination coverage",
      "Dental care",
      "Alternative therapy",
    ],
  },
];

const InsuranceOption = ({ itemId, selected, onSelect }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {insurancePlans.map((plan) => (
          <motion.button
            key={plan.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(plan)}
            className={`p-3 rounded-lg border-2 transition-all duration-300 ${
              selected?.id === plan.id
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-200 hover:border-indigo-300"
            }`}
          >
            <div className="text-left">
              <h4
                className={`font-medium ${
                  selected?.id === plan.id ? "text-indigo-600" : "text-gray-800"
                }`}
              >
                {plan.name}
              </h4>
              <p className="text-sm text-gray-600">₹{plan.price}/month</p>
            </div>
          </motion.button>
        ))}
      </div>

      {selected && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-medium text-gray-800">{selected.name}</h4>
              <p className="text-sm text-gray-600">₹{selected.price}/month</p>
            </div>
            <button
              onClick={() => onSelect(null)}
              className="p-1 hover:bg-red-50 rounded-full transition-colors"
            >
              <FiX className="text-red-500" />
            </button>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-700">{selected.coverage}</p>
            <ul className="space-y-1">
              {selected.benefits.map((benefit, index) => (
                <li
                  key={index}
                  className="flex items-center text-sm text-gray-600"
                >
                  <FiCheck className="mr-2 text-green-500" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default InsuranceOption;
