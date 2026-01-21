import express from "express";
import {authMiddleware} from "../middleware/authMiddleware.js";
import {searchServices,getRecentSearches} from "../controllers/searchController.js";

const router = express.Router();

router.get("/", authMiddleware, searchServices);
router.get("/recent", authMiddleware, getRecentSearches);

export default router;
