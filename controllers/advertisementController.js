import Advertisement from "../models/advertisementModel.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";

// Get a random active advertisement for logout
export const getLogoutAdvertisement = async (req, res) => {
    try {
        const count = await Advertisement.countDocuments({ isActive: true });

        if (count === 0) {
            return sendError(res, 404, "No active advertisements found");
        }

        const random = Math.floor(Math.random() * count);
        const ad = await Advertisement.findOne({ isActive: true }).skip(random);

        sendSuccess(res, 200, "Advertisement fetched", ad);
    } catch (error) {
        sendError(res, 500, "Server Error", error.message);
    }
};

// Create a new advertisement (Optional, for testing/admin purposes)
export const createAdvertisement = async (req, res) => {
    try {
        const { title, imageUrl, isActive } = req.body;

        const newAd = new Advertisement({
            title,
            imageUrl,
            isActive
        });

        const savedAd = await newAd.save();
        sendSuccess(res, 201, "Advertisement created", savedAd);
    } catch (error) {
        sendError(res, 500, "Server Error", error.message);
    }
};
