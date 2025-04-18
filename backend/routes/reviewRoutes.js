import express from "express";
import { submitReview } from "../controllers/reviewController.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

// Submit a review for a pet
router.post("/", userAuth, submitReview);

export default router;
