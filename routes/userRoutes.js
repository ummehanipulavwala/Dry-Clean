import express from "express";
<<<<<<< HEAD
import { getMyProfile, getUserById, updateUser, deleteUser } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
=======
import {getMyProfile,getUserById,updateUser,deleteUser} from "../controllers/userController.js";
import {authMiddleware} from "../middleware/authMiddleware.js";
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e

const router = express.Router();

router.get("/me", authMiddleware, getMyProfile);
router.get("/:id", authMiddleware, getUserById);
<<<<<<< HEAD
router.put("/:id", authMiddleware, upload.single("profileImage"), updateUser);
=======
router.put("/:id", authMiddleware, updateUser);
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
router.delete("/:id", authMiddleware, deleteUser);

export default router;
