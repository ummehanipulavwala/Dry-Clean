import Advertisement from "../models/advertisementModel.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";

// Get a random active advertisement for logout
export const getLogoutAdvertisement = async (req, res) => {
    try {
        const ads = await Advertisement.find({ isActive: true });

        if (!ads || ads.length === 0) {
            return sendError(res, 404, "No active advertisements found");
        }

        sendSuccess(res, 200, "Advertisements fetched", ads);
    } catch (error) {
        sendError(res, 500, "Server Error", error.message);
    }
};

// Get all advertisements (Management/Admin)
export const getAllAdvertisements = async (req, res) => {
    try {
        const ads = await Advertisement.find().sort({ createdAt: -1 });
        sendSuccess(res, 200, "All advertisements fetched", ads);
    } catch (error) {
        sendError(res, 500, "Server Error", error.message);
    }
};

// Get a single advertisement by ID
export const getAdvertisementById = async (req, res) => {
    try {
        const { id } = req.params;
        const ad = await Advertisement.findById(id);

        if (!ad) {
            return sendError(res, 404, "Advertisement not found");
        }

        sendSuccess(res, 200, "Advertisement fetched", ad);
    } catch (error) {
        sendError(res, 500, "Server Error", error.message);
    }
};

// Create a new advertisement (Optional, for testing/admin purposes)
export const createAdvertisement = async (req, res) => {
    try {
        const { title, imageUrl, image, discount, description, time, ratings, price, isActive } = req.body;

        const newAd = new Advertisement({
            title,
            imageUrl: imageUrl || image, // Support both 'imageUrl' and 'image'
            discount,
            description,
            time,
            ratings,
            price,
            isActive
        });

        const savedAd = await newAd.save();
        sendSuccess(res, 201, "Advertisement created", savedAd);
    } catch (error) {
        sendError(res, 500, "Server Error", error.message);
    }
};

// Update an advertisement
export const updateAdvertisement = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, imageUrl, image, discount, description, time, ratings, price, isActive } = req.body;

        const updateData = {
            title,
            imageUrl: imageUrl || image, // Support both 'imageUrl' and 'image'
            discount,
            description,
            time,
            ratings,
            price,
            isActive
        };

        // Remove undefined fields to avoid overwriting with null
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        const updatedAd = await Advertisement.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedAd) {
            return sendError(res, 404, "Advertisement not found");
        }

        sendSuccess(res, 200, "Advertisement updated", updatedAd);
    } catch (error) {
        sendError(res, 500, "Server Error", error.message);
    }
};

// Delete an advertisement
export const deleteAdvertisement = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedAd = await Advertisement.findByIdAndDelete(id);

        if (!deletedAd) {
            return sendError(res, 404, "Advertisement not found");
        }

        sendSuccess(res, 200, "Advertisement deleted", deletedAd);
    } catch (error) {
        sendError(res, 500, "Server Error", error.message);
    }
};
