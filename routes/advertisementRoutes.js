import express from "express";
import { getLogoutAdvertisement, getAllAdvertisements, getAdvertisementById, createAdvertisement, updateAdvertisement, deleteAdvertisement } from "../controllers/advertisementController.js";
import upload, { uploadAny } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/logout-ad", getLogoutAdvertisement);
router.get("/all", getAllAdvertisements);
router.get("/:id", getAdvertisementById);
router.post("/create", uploadAny, createAdvertisement);
router.put("/update/:id", uploadAny, updateAdvertisement);
router.delete("/delete/:id", deleteAdvertisement);

export default router;
