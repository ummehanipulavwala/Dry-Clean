import express from "express";
import { signup, signin, getProfile, forgotPassword, createNewPassword, saveuserdetails } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// SIGN UP
router.post("/signup", signup);

// SIGN IN
router.post("/signin", signin);

//Personal Information
router.get("/profile", authMiddleware, getProfile);

router.post("/forgot-password", forgotPassword);

router.post("/create-new-password", createNewPassword);

router.post("/signup", signup);

router.put("/saveuserdetails/:userId", upload.single("profileImage"), saveuserdetails);

// admin only route

router.get(
  "/admin/dashboard",
  authMiddleware,
  authorizeRoles("Admin"),
  (req, res) => {
    res.json({ message: "Welcome Admin" });
  }
);

// shop access only

router.get(
  "/shop/profile",
  authMiddleware,
  authorizeRoles("Shop"),
  (req, res) => {
    res.json({ message: "Welcome Shop Owner" });
  }
);

// user+admin access
router.get(
  "/profile",
  authMiddleware,
  authorizeRoles("User", "Admin"),
  (req, res) => {
    res.json({ message: "Profile access granted" });
  }
);

export default router;
