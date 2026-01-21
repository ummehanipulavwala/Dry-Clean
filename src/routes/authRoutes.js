import express from "express";
import { signup, signin ,getProfile, forgotPassword, createNewPassword } from "../controllers/authController.js";
import {authMiddleware} from "../middleware/authMiddleware.js";
import {authorizeRoles}  from "../middleware/authMiddleware.js";
import validateFormat from "../middleware/userValidationMiddleware.js";

const router = express.Router();

// SIGN UP
router.post("/signup",validateFormat, signup);

// SIGN IN
router.post("/signin", signin);

//Personal Information
router.get("/profile", authMiddleware, getProfile);

router.post("/forgot-password", forgotPassword);

router.post("/create-new-password", createNewPassword);

// admin only route

router.get(
  "/admin/dashboard",
  authMiddleware,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({ message: "Welcome Admin" });
  }
);

// shop access only

router.get(
  "/shop/profile",
  authMiddleware,
  authorizeRoles("shop"),
  (req, res) => {
    res.json({ message: "Welcome Shop Owner" });
  }
);

// user+admin access
router.get(
  "/profile",
    authMiddleware,
  authorizeRoles("user", "admin"),
  (req, res) => {
    res.json({ message: "Profile access granted" });
  }
);

export default router;
