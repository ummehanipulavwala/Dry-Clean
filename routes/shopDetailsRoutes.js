import express from "express";
import {
    createShopDetails,
    getMyShopDetails,
    updateShopDetails,
    getAllShops,
    getShopById,
    getRecentlyViewedShops,
} from "../controllers/shopDetailsController.js";
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Get Recently Viewed Shops (Authenticated)
router.get("/recent", authMiddleware, getRecentlyViewedShops);

// Create Shop Details (Shop only)
router.post(
    "/",
    authMiddleware,
    authorizeRoles("Shop", "Admin"),
    upload.single("shopImage"),
    createShopDetails
);

// Get My Shop Details
router.get("/me", authMiddleware, authorizeRoles("Shop", "Admin"), getMyShopDetails);

// Update Shop Details
router.put(
    "/",
    authMiddleware,
    authorizeRoles("Shop", "Admin"),
    upload.single("shopImage"),
    updateShopDetails
);

// Get All Shops (Public)
router.get("/", getAllShops);

// Get Shop by ID (Public)
router.get("/:id", getShopById);

export default router;
