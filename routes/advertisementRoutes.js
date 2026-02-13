import express from "express";
import { getLogoutAdvertisement, createAdvertisement } from "../controllers/advertisementController.js";

const router = express.Router();

router.get("/logout-ad", getLogoutAdvertisement);
router.post("/create", createAdvertisement); // Verify if protection is needed, keeping open for now as per simple request

export default router;
