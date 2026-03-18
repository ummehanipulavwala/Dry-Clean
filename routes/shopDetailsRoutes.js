import express from "express";
import {
    createShopDetails,
    getMyShopDetails,
    updateShopDetails,
    getAllShops,
    getShopById,
    getRecentlyViewedShops,
    getAdminShops,
    adminCreateShop,
    adminUpdateShop,
    adminDeleteShop,
} from "../controllers/shopDetailsController.js";
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleware.js";
import upload, { uploadAny } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Get Recently Viewed Shops (Authenticated)
router.get("/recent", authMiddleware, getRecentlyViewedShops);

// Get All Shops for Admin
router.get("/admin", authMiddleware, authorizeRoles("Admin"), getAdminShops);

// Admin operations for Shops
router.post("/admin/create", authMiddleware, authorizeRoles("Admin"), adminCreateShop);
router.put("/admin/:id", authMiddleware, authorizeRoles("Admin"), adminUpdateShop);
router.delete("/admin/:id", authMiddleware, authorizeRoles("Admin"), adminDeleteShop);

// Create Shop Details (Shop only)
router.post(
    "/",
    authMiddleware,
    authorizeRoles("Shop", "Admin"),
    uploadAny,
    createShopDetails
);

// Get My Shop Details
router.get("/me", authMiddleware, authorizeRoles("Shop", "Admin"), getMyShopDetails);

// Update Shop Details
router.put(
    "/",
    authMiddleware,
    authorizeRoles("Shop", "Admin"),
    uploadAny,
    updateShopDetails
);

// Get All Shops (Public)
router.get("/", getAllShops);

// Get Shop by ID (Public)
router.get("/:id", getShopById);

export default router;
