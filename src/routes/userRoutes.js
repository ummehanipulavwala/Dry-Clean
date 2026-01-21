import express from "express";
import {getMyProfile,getUserById,updateUser,deleteUser} from "../src/controllers/userController.js";
import {authMiddleware} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", authMiddleware, getMyProfile);
router.get("/:id", authMiddleware, getUserById);
router.put("/:id", authMiddleware, updateUser);
router.delete("/:id", authMiddleware, deleteUser);

export default router;
