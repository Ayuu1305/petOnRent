import Feedback from "../models/Feedback.js";

// Submit feedback
export const submitFeedback = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required",
      });
    }

    // Create new feedback
    const newFeedback = new Feedback({
      name,
      email,
      message,
    });

    // Save feedback to database
    await newFeedback.save();

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      feedback: newFeedback,
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit feedback",
      error: error.message,
    });
  }
};
