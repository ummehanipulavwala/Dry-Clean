import express from "express";
import { createService, getAllServices, updateService, deleteService, getServiceById, getAllAdminServices } from "../controllers/serviceController.js";
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleware.js";
import upload, { uploadAny } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Admin / Shop can create service with image upload
router.post(
  "/",
  authMiddleware,
  authorizeRoles("Admin", "Shop"),
  uploadAny, // field name from frontend
  createService
);

// Admin - Get all services (includes inactive)
router.get(
  "/admin/all",
  authMiddleware,
  authorizeRoles("Admin"),
  getAllAdminServices
);

// Admins – Get all services (Restricted from Public)
router.get("/", authMiddleware, authorizeRoles("Admin"), getAllServices);

// Public - Get Single Service by ID (Place this after specific paths)
router.get("/:id", getServiceById);

// Admin / Shop update service
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("Admin", "Shop"),
  uploadAny,
  updateService
);

// Admin delete service
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("Admin"),
  deleteService
);

export default router;
