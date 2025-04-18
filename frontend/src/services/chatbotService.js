// This service file provides functions for interacting with the chatbot
// In the future, this can be integrated with a real AI service like OpenAI, Dialogflow, etc.

// Predefined questions and answers for quick replies
export const quickReplies = [
  {
    id: 1,
    question: "What are your pet rental prices?",
    answer:
      "Our pet rental prices vary by pet type and duration. Dogs typically range from ₹500-2000 per day, cats from ₹300-1500 per day, and birds from ₹200-1000 per day. For specific pricing, please check our pet listings or contact us.",
    category: "pricing",
    keywords: ["price", "cost", "rent", "fee", "how much", "rate", "charge"],
  },
  {
    id: 2,
    question: "What is your cancellation policy?",
    answer:
      "You can cancel your booking up to 24 hours before the scheduled pickup time for a full refund. Cancellations made within 24 hours may incur a cancellation fee of 20% of the booking amount.",
    category: "policies",
    keywords: ["cancel", "refund", "policy", "change", "modify", "reschedule"],
  },
  {
    id: 3,
    question: "Do you offer pet insurance?",
    answer:
      "Yes, we offer pet insurance plans that cover accidents, illnesses, and routine care. Insurance costs vary based on the pet type and coverage level. You can add insurance during the checkout process.",
    category: "insurance",
    keywords: [
      "insurance",
      "cover",
      "protection",
      "accident",
      "illness",
      "health",
      "medical",
    ],
  },
  {
    id: 4,
    question: "How do I return a rented pet?",
    answer:
      "To return a rented pet, simply bring it back to our location during our business hours. Make sure the pet is in the same condition as when you received it. Our staff will inspect the pet and complete the return process.",
    category: "returns",
    keywords: [
      "return",
      "bring back",
      "drop off",
      "give back",
      "hand over",
      "complete rental",
    ],
  },
  {
    id: 5,
    question: "What happens if a pet gets sick while in my care?",
    answer:
      "If a pet gets sick while in your care, please contact us immediately at +91 9876543210. We have a 24/7 support line for emergencies. Our insurance plans cover veterinary expenses for accidents and illnesses.",
    category: "emergency",
    keywords: [
      "sick",
      "ill",
      "emergency",
      "vet",
      "veterinarian",
      "health",
      "medical",
      "problem",
    ],
  },
  {
    id: 6,
    question: "What documents do I need to rent a pet?",
    answer:
      "You'll need a valid government-issued ID, proof of address, and a signed rental agreement. For certain pets, we may also require proof of pet care experience or a home visit.",
    category: "requirements",
    keywords: [
      "document",
      "id",
      "proof",
      "require",
      "need",
      "paperwork",
      "verification",
    ],
  },
  {
    id: 7,
    question: "Do you provide pet supplies?",
    answer:
      "Yes, we offer a range of pet supplies including food, toys, bedding, and basic care items. These can be added to your rental package for an additional fee.",
    category: "supplies",
    keywords: [
      "supply",
      "food",
      "toy",
      "bedding",
      "accessory",
      "equipment",
      "item",
      "kit",
    ],
  },
  {
    id: 8,
    question: "What is your pet selection process?",
    answer:
      "We carefully match pets with renters based on experience level, living situation, and preferences. All our pets are health-checked, vaccinated, and temperament-tested to ensure safe and enjoyable experiences.",
    category: "selection",
    keywords: [
      "select",
      "match",
      "process",
      "choose",
      "pick",
      "find",
      "available",
      "breed",
    ],
  },
  {
    id: 9,
    question: "Can I extend my rental period?",
    answer:
      "Yes, you can extend your rental period as long as the pet is available for the extended dates. Please contact us at least 24 hours before your current rental period ends to arrange an extension.",
    category: "extensions",
    keywords: [
      "extend",
      "longer",
      "more days",
      "continue",
      "keep",
      "additional time",
    ],
  },
  {
    id: 10,
    question: "Do you offer pet training services?",
    answer:
      "Yes, we offer pet training services for an additional fee. Our certified trainers can help with basic obedience, house training, and behavior modification. Training sessions can be scheduled during your rental period.",
    category: "training",
    keywords: [
      "train",
      "training",
      "behavior",
      "obedience",
      "teach",
      "learn",
      "skill",
    ],
  },
  {
    id: 11,
    question: "What types of pets do you offer for rent?",
    answer:
      "We offer a variety of pets for rent including dogs, cats, birds, rabbits, hamsters, and guinea pigs. Each pet comes with its own care instructions and supplies. Check our listings for available pets.",
    category: "pet-types",
    keywords: [
      "type",
      "kind",
      "breed",
      "species",
      "animal",
      "dog",
      "cat",
      "bird",
      "rabbit",
    ],
  },
  {
    id: 12,
    question: "How do I make a reservation?",
    answer:
      "You can make a reservation through our website by selecting a pet, choosing your rental dates, and completing the checkout process. You'll need to create an account if you don't have one already.",
    category: "reservation",
    keywords: [
      "reserve",
      "book",
      "schedule",
      "appointment",
      "arrange",
      "set up",
      "make",
    ],
  },
];

// Welcome message for the chatbot
export const getWelcomeMessage = () => {
  return "Hello! I'm your pet rental assistant. How can I help you today? Feel free to ask about our services, pricing, policies, or select from the common questions below.";
};

// Get contact information
export const getContactInfo = () => {
  return {
    phone: "+91 7383367738",
    email: "support@petrental.com",
    address: "Naroda, Ahmedabad, Gujarat, India",
  };
};

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Save conversation to local storage
export const saveConversation = (messages) => {
  try {
    const timestamp = new Date().toISOString();
    const conversation = {
      id: timestamp,
      date: timestamp,
      messages: messages,
    };

    // Get existing conversations
    const existingConversations = JSON.parse(
      localStorage.getItem("chatbotConversations") || "[]"
    );

    // Add new conversation
    existingConversations.push(conversation);

    // Keep only the last 5 conversations
    const recentConversations = existingConversations.slice(-5);

    // Save to local storage
    localStorage.setItem(
      "chatbotConversations",
      JSON.stringify(recentConversations)
    );

    return true;
  } catch (error) {
    console.error("Error saving conversation:", error);
    return false;
  }
};

// Load conversations from local storage
export const loadConversations = () => {
  try {
    return JSON.parse(localStorage.getItem("chatbotConversations") || "[]");
  } catch (error) {
    console.error("Error loading conversations:", error);
    return [];
  }
};

// Main function to get chatbot response
export const getChatbotResponse = async (message) => {
  // Simulate API delay
  await delay(1000);

  const lowerCaseMessage = message.toLowerCase();

  // Check for greetings
  if (
    lowerCaseMessage.includes("hi") ||
    lowerCaseMessage.includes("hello") ||
    lowerCaseMessage.includes("hey") ||
    lowerCaseMessage.includes("good morning") ||
    lowerCaseMessage.includes("good afternoon") ||
    lowerCaseMessage.includes("good evening")
  ) {
    return "Hello! How can I assist you today?";
  }

  // Check for thank you messages
  if (
    lowerCaseMessage.includes("thank") ||
    lowerCaseMessage.includes("thanks") ||
    lowerCaseMessage.includes("appreciate")
  ) {
    return "You're welcome! Is there anything else I can help you with?";
  }

  // Check for goodbye messages
  if (
    lowerCaseMessage.includes("bye") ||
    lowerCaseMessage.includes("goodbye") ||
    lowerCaseMessage.includes("see you") ||
    lowerCaseMessage.includes("farewell")
  ) {
    return "Goodbye! Have a great day! Feel free to chat again if you need any help.";
  }

  // Check for help requests
  if (lowerCaseMessage.includes("help")) {
    return "I'm here to help! You can ask me about:\n- Pet rental prices\n- Booking process\n- Insurance options\n- Cancellation policies\n- Pet care guidelines\nOr select from the common questions above.";
  }

  // Check for contact information requests
  if (
    lowerCaseMessage.includes("contact") ||
    lowerCaseMessage.includes("phone") ||
    lowerCaseMessage.includes("email") ||
    lowerCaseMessage.includes("address") ||
    lowerCaseMessage.includes("reach") ||
    lowerCaseMessage.includes("support")
  ) {
    const contactInfo = getContactInfo();
    return `You can reach us at:\nPhone: ${contactInfo.phone}\nEmail: ${contactInfo.email}\nAddress: ${contactInfo.address}\nOur support hours are 9 AM to 9 PM, 7 days a week.`;
  }

  // Check for business hours
  if (
    lowerCaseMessage.includes("hour") ||
    lowerCaseMessage.includes("open") ||
    lowerCaseMessage.includes("close") ||
    lowerCaseMessage.includes("time") ||
    lowerCaseMessage.includes("when")
  ) {
    return "We are open from 9 AM to 9 PM, 7 days a week. You can make reservations online 24/7.";
  }

  // Check for location
  if (
    lowerCaseMessage.includes("where") ||
    lowerCaseMessage.includes("location") ||
    lowerCaseMessage.includes("address") ||
    lowerCaseMessage.includes("place")
  ) {
    const contactInfo = getContactInfo();
    return `We are located at ${contactInfo.address}. You can find us on Google Maps by searching for "Pet Rental Mumbai".`;
  }

  // Check for payment methods
  if (
    lowerCaseMessage.includes("pay") ||
    lowerCaseMessage.includes("payment") ||
    lowerCaseMessage.includes("card") ||
    lowerCaseMessage.includes("cash") ||
    lowerCaseMessage.includes("online")
  ) {
    return "We accept all major credit and debit cards, UPI, and cash payments. Online payments are processed securely through our website.";
  }

  // Check for keywords related to our quick replies
  // First, find the best match based on keyword count
  let bestMatch = null;
  let maxKeywordMatches = 0;

  for (const reply of quickReplies) {
    let keywordMatches = 0;
    for (const keyword of reply.keywords) {
      if (lowerCaseMessage.includes(keyword)) {
        keywordMatches++;
      }
    }

    if (keywordMatches > maxKeywordMatches) {
      maxKeywordMatches = keywordMatches;
      bestMatch = reply;
    }
  }

  // If we found a good match (at least 2 keyword matches), return that answer
  if (bestMatch && maxKeywordMatches >= 2) {
    return bestMatch.answer;
  }

  // If we have a single keyword match, return that answer
  if (bestMatch && maxKeywordMatches === 1) {
    return bestMatch.answer;
  }

  // Default response for unrecognized messages
  return "I'm not sure I understand. You can select from the common questions above or contact our support team at +91 9876543210 for assistance.";
};
