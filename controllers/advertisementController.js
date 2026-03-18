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
        const bodyObj = req.body || {};
        const { title, imageUrl, image, discount, description, time, ratings, price, isActive } = bodyObj;

        if (!title) {
            return sendError(res, 400, "Title is required for advertisement");
        }

        // If a file was uploaded, use its path
        console.log("LOG: Processing image...");
        let finalImageUrl = imageUrl || image;

        // When using upload.any(), files are in req.files as an array
        if (req.files && req.files.length > 0) {
            // Find the first file that looks like an image field
            const imageFile = req.files.find(f =>
                f.fieldname === 'image' ||
                f.fieldname === 'imageUrl' ||
                f.fieldname === 'shopImage' ||
                f.fieldname === 'profileImage'
            ) || req.files[0]; // Fallback to first file if no match

            if (imageFile) {
                finalImageUrl = `/uploads/advertisements/${imageFile.filename}`;
            }
        } else if (req.file) {
            finalImageUrl = `/uploads/advertisements/${req.file.filename}`;
        }

        if (!finalImageUrl) {
            return sendError(res, 400, "Image is required for advertisement");
        }

        const newAd = new Advertisement({
            title,
            imageUrl: finalImageUrl,
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
        const { title, imageUrl, image, discount, description, time, ratings, price, isActive } = req.body || {};

        let finalImageUrl = imageUrl || image;

        // When using upload.any(), files are in req.files as an array
        if (req.files && req.files.length > 0) {
            const imageFile = req.files.find(f =>
                f.fieldname === 'image' ||
                f.fieldname === 'imageUrl' ||
                f.fieldname === 'shopImage' ||
                f.fieldname === 'profileImage'
            ) || req.files[0];

            if (imageFile) {
                finalImageUrl = `/uploads/advertisements/${imageFile.filename}`;
            }
        } else if (req.file) {
            finalImageUrl = `/uploads/advertisements/${req.file.filename}`;
        }

        const updateData = {
            title,
            imageUrl: finalImageUrl,
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
