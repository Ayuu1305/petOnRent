import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
    },
    issueType: {
      type: String,
      required: [true, "Issue type is required"],
      enum: [
        "rental",
        "purchase",
        "support",
        "technical",
        "billing",
        "general",
        "other",
      ],
    },
    petCategory: {
      type: String,
      enum: ["dog", "cat", "bird", "fish", "other", ""],
      default: "",
    },
    petName: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved", "cancelled"],
      default: "pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    expectedResolutionDate: {
      type: Date,
      default: () => new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  },
  {
    timestamps: true,
  }
);

const Issue = mongoose.model("Issue", issueSchema);

export default Issue;
