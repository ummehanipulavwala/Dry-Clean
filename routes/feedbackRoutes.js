import express from "express";
import { createFeedback, getAllFeedbacks } from "../controllers/feedbackController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create Feedback (Authenticated)
router.post("/", authMiddleware, createFeedback);

// Get All Feedbacks (Public/Admin)
router.get("/", getAllFeedbacks);

export default router;
