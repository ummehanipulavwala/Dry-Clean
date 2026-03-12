import express from "express";
import {
    addReview,
    getShopReviews,
    getMyReviews,
    updateReview,
    deleteReview,
} from "../controllers/reviewController.js";
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Add a review (authenticated users — not shops or admins)
router.post("/", authMiddleware, addReview);

// Get reviews for a specific shop (public)
router.get("/shop/:shopId", getShopReviews);

// Get my own reviews (authenticated)
router.get("/my", authMiddleware, getMyReviews);

// Update a review (owner only)
router.put("/:id", authMiddleware, updateReview);

// Delete a review (owner or admin)
router.delete("/:id", authMiddleware, deleteReview);

export default router;
