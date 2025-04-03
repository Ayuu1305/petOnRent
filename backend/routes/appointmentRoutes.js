import express from "express";
import mongoose from "mongoose";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

// Define a schema for appointments if not already defined elsewhere
const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
    },
    petName: {
      type: String,
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    appointmentTime: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    isHomeVisit: {
      type: Boolean,
      default: false,
    },
    address: {
      type: String,
    },
    notes: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    doctorName: {
      type: String,
      default: "Dr. Available Vet",
    },
  },
  { timestamps: true }
);

// Create the model if it doesn't exist
let Appointment;
try {
  Appointment = mongoose.model("Appointment");
} catch (error) {
  Appointment = mongoose.model("Appointment", appointmentSchema);
}

// Get all appointments for a user
router.get("/", userAuth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user.id }).sort({
      appointmentDate: 1,
      appointmentTime: 1,
    });

    res.status(200).json({
      success: true,
      appointments: appointments || [],
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
      error: error.message,
    });
  }
});

// Create a new appointment
router.post("/", userAuth, async (req, res) => {
  try {
    const appointmentData = {
      ...req.body,
      userId: req.user.id,
    };

    const appointment = new Appointment(appointmentData);
    await appointment.save();

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to book appointment",
      error: error.message,
    });
  }
});

// Cancel an appointment
router.patch("/:id/cancel", userAuth, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found or you don't have permission",
      });
    }

    appointment.status = "cancelled";
    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      appointment,
    });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel appointment",
      error: error.message,
    });
  }
});

export default router;
