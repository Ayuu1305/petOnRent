import Pet from "../models/Pet.js";

// Submit a review for a pet
export const submitReview = async (req, res) => {
  try {
    const { petId, userId, rating, comment, orderType } = req.body;

    // Validate input
    if (!petId || !userId || !rating) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: petId, userId, or rating",
      });
    }

    // Validate rating
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5",
      });
    }

    // Find the pet
    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "Pet not found",
      });
    }

    // Check for duplicate review from the same user for the same order type
    const existingReview = pet.reviews.find(
      (r) => r.userId === userId && r.orderType === orderType
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: `You have already reviewed this pet for ${orderType}. You can review it again for a different type of interaction.`,
      });
    }

    // Add the review
    pet.reviews.push({
      userId,
      rating,
      comment: comment || "",
      date: new Date(),
      orderType: orderType || "purchase", // Default to purchase if not specified
    });

    // Update average rating
    pet.averageRating =
      pet.reviews.reduce((acc, r) => acc + r.rating, 0) / pet.reviews.length;

    // Save the updated pet
    await pet.save();

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      pet,
    });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add review",
      error: error.message,
    });
  }
};
