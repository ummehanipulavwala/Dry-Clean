import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/stats", authMiddleware, authorizeRoles("Admin"), getDashboardStats);

export default router;
