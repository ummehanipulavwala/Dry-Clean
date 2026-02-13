import Advertisement from "../models/advertisementModel.js";

// Get a random active advertisement for logout
export const getLogoutAdvertisement = async (req, res) => {
    try {
        const count = await Advertisement.countDocuments({ isActive: true });

        if (count === 0) {
            return res.status(404).json({ message: "No active advertisements found" });
        }

        const random = Math.floor(Math.random() * count);
        const ad = await Advertisement.findOne({ isActive: true }).skip(random);

        res.status(200).json(ad);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
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
        res.status(201).json(savedAd);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
