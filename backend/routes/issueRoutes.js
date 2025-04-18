import express from "express";
import {
  submitIssue,
  getIssuesByEmail,
  updateIssueStatus,
} from "../controllers/issueController.js";

const router = express.Router();

// Submit a new issue
router.post("/", submitIssue);

// Get issues by email
router.get("/user/:email", getIssuesByEmail);

router.put(
  '/:issueId/status', // Matches the path the browser is requesting
  // authMiddleware, // Uncomment if needed
  updateIssueStatus   // Tells the router to use this function
);

export default router;
