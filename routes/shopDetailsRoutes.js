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
<<<<<<< HEAD
    authorizeRoles("Shop", "Admin"),
=======
    authorizeRoles("Shop"),
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
    upload.single("shopImage"),
    createShopDetails
);

// Get My Shop Details
<<<<<<< HEAD
router.get("/me", authMiddleware, authorizeRoles("Shop", "Admin"), getMyShopDetails);
=======
router.get("/me", authMiddleware, authorizeRoles("Shop"), getMyShopDetails);
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e

// Update Shop Details
router.put(
    "/",
    authMiddleware,
<<<<<<< HEAD
    authorizeRoles("Shop", "Admin"),
=======
    authorizeRoles("Shop"),
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
    upload.single("shopImage"),
    updateShopDetails
);

// Get All Shops (Public)
router.get("/", getAllShops);

// Get Shop by ID (Public)
router.get("/:id", getShopById);

export default router;
