import express from "express";
import mongoose from "mongoose";
import userAuth from "../middleware/userAuth.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Define a schema for insurance policies if not already defined elsewhere
const insuranceSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
    },
    petName: {
      type: String,
      required: true,
    },
    planType: {
      type: String,
      enum: ["basic", "standard", "premium"],
      required: true,
    },
    coverageAmount: {
      type: Number,
      required: true,
    },
    monthlyPremium: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
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
    benefits: [String],
    claimHistory: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        amount: {
          type: Number,
          required: true,
        },
        reason: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          default: "",
        },
        documentPath: {
          type: String,
          default: null,
        },
        documentType: {
          type: String,
          enum: ["pdf", "jpg", "jpeg", "png", null],
          default: null,
        },
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
        remarks: {
          type: String,
          default: "",
        },
      },
    ],
    cancellationDate: {
      type: Date,
      default: null,
    },
    cancellationReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Create the model if it doesn't exist
let Insurance;
try {
  Insurance = mongoose.model("Insurance");
} catch (error) {
  Insurance = mongoose.model("Insurance", insuranceSchema);
}

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size too large. Maximum size is 5MB",
      });
    }
    return res.status(400).json({
      success: false,
      message: "File upload error: " + err.message,
    });
  }
  next(err);
};

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create directory if it doesn't exist
    const dir = "uploads/insurance-claims";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "claim-" + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [".pdf", ".jpg", ".jpeg", ".png"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(ext)) {
    // Accept file
    cb(null, true);
  } else {
    // Reject file
    cb(
      new Error("Invalid file type. Only PDF, JPG, and PNG files are allowed."),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1, // Only allow 1 file
  },
});

// Get all insurance policies for a user
router.get("/", userAuth, async (req, res) => {
  try {
    const policies = await Insurance.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      policies: policies || [],
    });
  } catch (error) {
    console.error("Error fetching insurance policies:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch insurance policies",
      error: error.message,
    });
  }
});

// Create a new insurance policy
router.post("/", userAuth, async (req, res) => {
  try {
    const {
      petId,
      petName,
      petType,
      breed,
      age,
      gender,
      medicalHistory,
      planType,
      planName,
      coverageAmount,
      monthlyPremium,
      benefits,
      startDate,
      endDate,
      status,
    } = req.body;

    if (!petId || !petName || !planType) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: petId, petName, or planType",
      });
    }

    const insuranceData = {
      userId: req.user.id,
      petId,
      petName,
      petType,
      breed,
      age,
      gender,
      medicalHistory,
      planType,
      planName,
      coverageAmount,
      monthlyPremium,
      benefits,
      startDate: startDate || new Date(),
      endDate:
        endDate ||
        new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      status: status || "active",
    };

    const insurance = new Insurance(insuranceData);
    await insurance.save();

    res.status(201).json({
      success: true,
      message: "Insurance policy created successfully",
      insurance,
    });
  } catch (error) {
    console.error("Error creating insurance policy:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create insurance policy",
      error: error.message,
    });
  }
});

// Get a specific insurance policy
router.get("/:id", userAuth, async (req, res) => {
  try {
    const policy = await Insurance.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: "Insurance policy not found",
      });
    }

    res.status(200).json({
      success: true,
      policy,
    });
  } catch (error) {
    console.error("Error fetching insurance policy:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch insurance policy",
      error: error.message,
    });
  }
});

// Cancel an insurance policy
router.patch("/:id/cancel", userAuth, async (req, res) => {
  try {
    const policy = await Insurance.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: "Insurance policy not found",
      });
    }

    if (policy.status !== "active") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a policy that is already ${policy.status}`,
      });
    }

    policy.status = "cancelled";
    await policy.save();

    res.status(200).json({
      success: true,
      message: "Insurance policy cancelled successfully",
      policy,
    });
  } catch (error) {
    console.error("Error cancelling insurance policy:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel insurance policy",
      error: error.message,
    });
  }
});

// Submit a claim with improved error handling
router.post("/:id/claim", userAuth, async (req, res) => {
  try {
    // First check if the policy exists and is active before handling file upload
    const policy = await Insurance.findOne({
      _id: req.params.id,
      userId: req.user.id,
      status: "active",
    });

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: "Active insurance policy not found",
      });
    }

    // Use multer upload with error handling
    upload.single("documents")(req, res, async (err) => {
      try {
        if (err) {
          return res.status(400).json({
            success: false,
            message: err.message,
          });
        }

        const { amount, reason, description } = req.body;

        if (!amount || !reason) {
          // Remove uploaded file if validation fails
          if (req.file) {
            fs.unlinkSync(req.file.path);
          }
          return res.status(400).json({
            success: false,
            message: "Missing required fields: amount or reason",
          });
        }

        const claimAmount = parseFloat(amount);
        if (claimAmount > policy.coverageAmount) {
          // Remove uploaded file if validation fails
          if (req.file) {
            fs.unlinkSync(req.file.path);
          }
          return res.status(400).json({
            success: false,
            message: "Claim amount exceeds coverage limit",
          });
        }

        const newClaim = {
          date: new Date(),
          amount: claimAmount,
          reason,
          description: description || "",
          status: "pending",
          documentPath: req.file ? req.file.path : null,
          documentType: req.file
            ? path.extname(req.file.originalname).substring(1)
            : null,
        };

        policy.claimHistory.push(newClaim);
        await policy.save();

        res.status(201).json({
          success: true,
          message: "Claim submitted successfully",
          claim: newClaim,
        });
      } catch (error) {
        // Remove uploaded file if an error occurs
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        throw error;
      }
    });
  } catch (error) {
    console.error("Error submitting claim:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit claim",
      error: error.message,
    });
  }
});

// Add route to get claim document
router.get("/:id/claim/:claimId/document", userAuth, async (req, res) => {
  try {
    const policy = await Insurance.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: "Insurance policy not found",
      });
    }

    const claim = policy.claimHistory.id(req.params.claimId);
    if (!claim || !claim.documentPath) {
      return res.status(404).json({
        success: false,
        message: "Claim document not found",
      });
    }

    res.sendFile(path.resolve(claim.documentPath));
  } catch (error) {
    console.error("Error fetching claim document:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch claim document",
      error: error.message,
    });
  }
});

export default router;
