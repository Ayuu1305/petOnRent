import mongoose from "mongoose";

const claimSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  documentPath: {
    type: String
  },
  documentType: {
    type: String,
    enum: ['pdf', 'jpg', 'jpeg', 'png']
  },
  approvalDate: {
    type: Date
  },
  approvalNotes: {
    type: String
  }
});

const insuranceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: true,
    },
    petName: {
      type: String,
      required: true,
    },
    petType: {
      type: String,
      required: true,
    },
    breed: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    medicalHistory: {
      type: String,
      default: "",
    },
    planType: {
      type: String,
      enum: ["basic", "standard", "premium"],
      required: true,
    },
    planName: {
      type: String,
      required: true,
    },
    coverageAmount: {
      type: Number,
      required: true,
    },
    premium: {
      type: Number,
      required: true,
    },
    benefits: [String],
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },
    cancellationDate: {
      type: Date,
    },
    cancellationReason: {
      type: String,
    },
    claimHistory: [claimSchema],
    policyNumber: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const Insurance =
  mongoose.models.Insurance || mongoose.model("Insurance", insuranceSchema);

export default Insurance;
