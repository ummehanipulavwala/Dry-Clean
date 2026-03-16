import express from "express";
import { getLogoutAdvertisement, getAllAdvertisements, getAdvertisementById, createAdvertisement, updateAdvertisement, deleteAdvertisement } from "../controllers/advertisementController.js";

const router = express.Router();

router.get("/logout-ad", getLogoutAdvertisement);
router.get("/all", getAllAdvertisements);
router.get("/:id", getAdvertisementById);
router.post("/create", createAdvertisement); // Verify if protection is needed, keeping open for now as per simple request
router.put("/update/:id", updateAdvertisement);
router.delete("/delete/:id", deleteAdvertisement);

export default router;
