import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { searchServices, getRecentSearches, deleteRecentSearch, getSearchLogs } from "../controllers/searchController.js";

const router = express.Router();

router.get("/", authMiddleware, searchServices);
router.get("/recent", authMiddleware, getRecentSearches);
router.get("/logs", authMiddleware, getSearchLogs); // New Logs Route using Search Model
router.delete("/recent/:id", authMiddleware, deleteRecentSearch);

export default router;
