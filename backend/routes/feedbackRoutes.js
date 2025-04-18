import express from "express";
import { submitFeedback } from "../controllers/feedbackController.js";

const router = express.Router();

// Submit feedback
router.post("/submit", submitFeedback);

export default router;
