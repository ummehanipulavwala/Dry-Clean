import Advertisement from "../models/advertisementModel.js";
<<<<<<< HEAD
import { sendSuccess, sendError } from "../utils/responseHandler.js";
=======
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e

// Get a random active advertisement for logout
export const getLogoutAdvertisement = async (req, res) => {
    try {
        const count = await Advertisement.countDocuments({ isActive: true });

        if (count === 0) {
<<<<<<< HEAD
            return sendError(res, 404, "No active advertisements found");
=======
            return res.status(404).json({ message: "No active advertisements found" });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
        }

        const random = Math.floor(Math.random() * count);
        const ad = await Advertisement.findOne({ isActive: true }).skip(random);

<<<<<<< HEAD
        sendSuccess(res, 200, "Advertisement fetched", ad);
    } catch (error) {
        sendError(res, 500, "Server Error", error.message);
=======
        res.status(200).json(ad);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
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
<<<<<<< HEAD
        sendSuccess(res, 201, "Advertisement created", savedAd);
    } catch (error) {
        sendError(res, 500, "Server Error", error.message);
=======
        res.status(201).json(savedAd);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
    }
};
