import Issue from "../models/Issue.js";

export const submitIssue = async (req, res) => {
  try {
    const { name, email, phone, issueType, petCategory, petName, description } =
      req.body;

    // Validate required fields
    if (!name || !email || !phone || !issueType || !description) {
      return res.status(400).json({
        message: "Name, email, phone, issue type, and description are required",
      });
    }

    // Create new issue
    const newIssue = new Issue({
      name,
      email,
      phone,
      issueType,
      petCategory,
      petName,
      description,
      status: "pending",
      expectedResolutionDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    });

    // Save issue to database
    const savedIssue = await newIssue.save();

    // Return just the saved issue object
    res.status(201).json(savedIssue);
  } catch (error) {
    console.error("Error submitting issue:", error);

    // If it's a validation error, send the specific validation message
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    // For other errors
    res.status(500).json({
      message: "Failed to submit issue",
      error: error.message,
    });
  }
};

// Get issues by email
export const getIssuesByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    // Find all issues for the given email
    const issues = await Issue.find({ email }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      issues,
    });
  } catch (error) {
    console.error("Error fetching issues:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch issues",
      error: error.message,
    });
  }
};

// Add this function:
export const updateIssueStatus = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { status } = req.body; // Get the new status from the request body

    // Optional: Validate the incoming status value against allowed statuses if needed
    const allowedStatuses = ["pending", "in-progress", "resolved", "cancelled"];
    if (!allowedStatuses.includes(status)) {
      return res
        .status(400)
        .json({ message: `Invalid status value: ${status}` });
    }

    const updatedIssue = await Issue.findByIdAndUpdate(
      issueId,
      {
        status: status,
        lastUpdated: new Date(), // Also update the lastUpdated timestamp
      },
      { new: true, runValidators: true } // Return the updated document and run schema validators
    );

    if (!updatedIssue) {
      // Use 404 if the issue with the given ID was not found
      return res.status(404).json({ message: "Issue not found" });
    }

    // Send the updated issue back as JSON with a 200 OK status
    res.status(200).json(updatedIssue);
  } catch (error) {
    console.error("Error updating issue status:", error);

    // Handle potential CastError if issueId is not a valid ObjectId format
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid Issue ID format" });
    }
    // Handle potential validation errors during update (e.g., if status enum fails)
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    // Generic server error for other cases
    res.status(500).json({ message: "Server error updating issue status" });
  }
};
