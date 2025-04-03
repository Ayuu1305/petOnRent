import express from "express";
import Pet from "../models/Pet.js";
import User from "../models/User.js";
import { hashPassword } from "../utils/hashPassword.js";
import adminAuth from "../middleware/authMiddleware.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

/* ===========================
        PET MANAGEMENT
   =========================== */

// ✅ Add a new pet (Admin Only)
router.post("/add", adminAuth, async (req, res) => {
  try {
    const pet = new Pet(req.body);
    await pet.save();
    res.status(201).json({ message: "Pet added successfully", pet });
  } catch (error) {
    res.status(500).json({ error: "Error adding pet: " + error.message });
  }
});

router.get("/api/pets", async (req, res) => {
  try {
    const pets = await Pet.find(); // Fetch all pets from database
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Get All Pets
router.get("/", async (req, res) => {
  try {
    const pets = await Pet.find(); // Fetch all pets from MongoDB
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pets", error });
  }
});

// ✅ Get all pets (Admin Only)
router.get("/pets", adminAuth, async (req, res) => {
  try {
    const pets = await Pet.find();
    res.status(200).json(pets);
  } catch (error) {
    res.status(500).json({ error: "Error fetching pets: " + error.message });
  }
});

// GET a single pet by ID
router.get("/pets/:id", adminAuth, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ error: "Pet not found" });
    }
    res.status(200).json(pet);
  } catch (error) {
    res.status(500).json({ error: "Error fetching pet: " + error.message });
  }
});

// ✅ Update Pet Route (PUT request)
// router.put("/pets/:id", adminAuth, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updatedPet = await Pet.findByIdAndUpdate(id, req.body, { new: true });

//     if (!updatedPet) {
//       return res.status(404).json({ error: "Pet not found" });
//     }

//     res.json({ message: "Pet updated successfully", pet: updatedPet });
//   } catch (error) {
//     res.status(500).json({ error: "Error updating pet: " + error.message });
//   }
// });

// router.get("/pets/:id", adminAuth, async (req, res) => {
//     try {
//       const pet = await Pet.findById(req.params.id);
//       if (!pet) {
//         return res.status(404).json({ error: "Pet not found" });
//       }
//       res.status(200).json(pet);
//     } catch (error) {
//       res.status(500).json({ error: "Error fetching pet: " + error.message });
//     }
//   });

router.put("/pets/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find the pet by ID and update it
    const updatedPet = await Pet.findByIdAndUpdate(id, updateData, {
      new: true, // Return the updated document
      runValidators: true, // Run schema validators on update
    });

    // If no pet is found, return a 404 error
    if (!updatedPet) {
      return res.status(404).json({ error: "Pet not found" });
    }

    // Return the updated pet
    res.status(200).json(updatedPet);
  } catch (error) {
    res.status(500).json({ error: "Error updating pet: " + error.message });
  }
});

// ✅ DELETE Pet Route
router.delete("/pets/:id", adminAuth, async (req, res) => {
  try {
    const pet = await Pet.findByIdAndDelete(req.params.id);

    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    res.json({ message: "Pet deleted successfully", deletedPet: pet });
  } catch (error) {
    res.status(500).json({ error: "Error deleting pet: " + error.message });
  }
});

/* ===========================
        ADMIN MANAGEMENT
   =========================== */

// ✅ Create an Admin User (One-Time Use)
router.post("/create-admin", async (req, res) => {
  try {
    console.log("🔹 Received request to create admin");
    console.log("📩 Request Body:", req.body);

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      console.log("❌ Missing fields:", { name, email, password });
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("❌ Admin already exists:", email);
      return res.status(409).json({ error: "Admin already exists" });
    }

    const hashedPassword = await hashPassword(password);
    const adminUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    await adminUser.save();
    console.log("✅ Admin created:", adminUser);

    res.status(201).json({ message: "Admin user created successfully!" });
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
    res.status(500).json({ error: "Error creating admin: " + error.message });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("🔹 Login attempt for:", email); // Debugging

    // 🔹 Check if the admin exists
    const admin = await User.findOne({ email, role: "admin" });

    if (!admin) {
      console.log("❌ Admin not found:", email);
      return res.status(400).json({ error: "Invalid email or not an admin" });
    }

    console.log("✅ Admin found:", admin);

    // 🔹 Compare entered password with hashed password in DB
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      console.log("❌ Incorrect password attempt for:", email);
      return res.status(400).json({ error: "Incorrect password" });
    }

    console.log("✅ Password matched!");

    // 🔹 Generate JWT Token
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET || "defaultSecretKey",
      { expiresIn: "2h" }
    );

    console.log("✅ Token generated successfully!");

    res.status(200).json({ message: "Login successful", token , role:admin.role,});
  } catch (error) {
    console.error("❌ Login error:", error.message); // Log error message
    res.status(500).json({ error: "Something went wrong: " + error.message });
  }
});



router.get("/test", (req, res) => {
  res.send("Admin Routes are working!");
});



export default router;
