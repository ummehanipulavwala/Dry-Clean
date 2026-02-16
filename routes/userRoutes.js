import express from "express";
import { getMyProfile, getUserById, updateUser, deleteUser } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/me", authMiddleware, getMyProfile);
router.get("/:id", authMiddleware, getUserById);
router.put("/:id", authMiddleware, upload.single("profileImage"), updateUser);
router.delete("/:id", authMiddleware, deleteUser);

export default router;
