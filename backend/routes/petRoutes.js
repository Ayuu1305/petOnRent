import express from "express";
import Pet from "../models/Pet.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

// GET all pets
router.get("/", async (req, res) => {
  // ✅ Correct path: Just "/"
  try {
    const pets = await Pet.find();
    res.json(pets);
  } catch (error) {
    console.error("Error fetching pets:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get pets by user ID (for appointments page)
router.get("/user", userAuth, async (req, res) => {
  try {
    // For now, just return all pets since we don't have a user-pet relationship
    // In a real app, you would filter by user ID: { userId: req.user.id }
    const pets = await Pet.find();
    res.status(200).json({ success: true, pets });
  } catch (error) {
    console.error("Error fetching user pets:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user pets",
      error: error.message,
    });
  }
});

// POST /api/pets - Fetch specific pets by IDs (for Checkout.js)
router.post("/", async (req, res) => {
  const { petIds, userId } = req.body;
  try {
    if (!petIds || !Array.isArray(petIds) || !userId) {
      return res.status(400).json({ message: "Missing petIds or userId" });
    }
    const pets = await Pet.find({ _id: { $in: petIds } });
    res.json(pets);
  } catch (error) {
    console.error("Error fetching pets by IDs:", error);
    res
      .status(500)
      .json({ message: "Error fetching pets", error: error.message });
  }
});

// ✅ Fetch a single pet by ID
router.get("/:id", async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ error: "Pet not found" });
    }
    res.status(200).json(pet);
  } catch (error) {
    console.error("Error fetching pet:", error);
    res.status(500).json({ error: "Error fetching pet: " + error.message });
  }
});

// ✅ Fetch specific pets by IDs (For filtering)
router.post("/api/pets/filter", async (req, res) => {
  const { petIds, userId } = req.body;
  try {
    if (!petIds || !Array.isArray(petIds) || !userId) {
      return res.status(400).json({ message: "Missing petIds or userId" });
    }
    const pets = await Pet.find({ _id: { $in: petIds } });
    res.json(pets);
  } catch (error) {
    console.error("Error fetching pets:", error);
    res
      .status(500)
      .json({ message: "Error fetching pets", error: error.message });
  }
});

export default router;
