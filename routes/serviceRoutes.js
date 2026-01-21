import express from "express";
import {createService,getAllServices,updateService,deleteService,} from "../controllers/serviceController.js";
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Admin / Shop can create service
router.post(
  "/",
  authMiddleware,
  authorizeRoles("Admin", "Shop"),
  createService
);

// Public – Get all services
router.get("/", getAllServices);

// Admin / Shop update service
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("Admin", "Shop"),
  updateService
);

// Admin delete service
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("Admin"),
  deleteService
);

// Create service with image upload
router.post(
  "/",
  authMiddleware,
  upload.single("image"), // field name from frontend
  createService,
  (req, res) => {
    res.status(200).json({
      message: "Image uploaded successfully",
      imageUrl: `/uploads/${req.file.filename}`,
    });
  }
);

export default router;
