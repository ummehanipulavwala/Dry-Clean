import ShopDetails from "../models/Shopdetails.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";


// Create Shop Details
export const createShopDetails = async (req, res) => {
    try {
        const { shopName, shopAddress, shopRatings } = req.body;
        const userId = req.user.id;

        // Check if shop details already exist for this user
        const existingShop = await ShopDetails.findOne({ userId });
        if (existingShop) {
            return res.status(400).json({ message: "Shop details already exist" });
        }

        const shopImage = req.file ? `/uploads/profiles/${req.file.filename}` : "";

        const shopDetails = await ShopDetails.create({
            userId,
            shopName,
            shopAddress,
            shopRatings: shopRatings || 0,
            shopImage,
        });

        res.status(201).json(shopDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get My Shop Details
export const getMyShopDetails = async (req, res) => {
    try {
        const shopDetails = await ShopDetails.findOne({ userId: req.user.id });

        if (!shopDetails) {
            return res.status(404).json({ message: "Shop details not found" });
        }

        res.status(200).json(shopDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Shop Details
export const updateShopDetails = async (req, res) => {
    try {
        const { shopName, shopAddress, shopRatings } = req.body;
        const userId = req.user.id;

        let updateData = {
            ...(shopName && { shopName }),
            ...(shopAddress && { shopAddress }),
            ...(shopRatings && { shopRatings }),
        };

        if (req.file) {
            updateData.shopImage = `/uploads/profiles/${req.file.filename}`;
        }

        const shopDetails = await ShopDetails.findOneAndUpdate(
            { userId },
            { $set: updateData },
            { new: true }
        );

        if (!shopDetails) {
            return res.status(404).json({ message: "Shop details not found" });
        }

        res.status(200).json(shopDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get All Shops (Public)
export const getAllShops = async (req, res) => {
    try {
        const shops = await ShopDetails.find().populate("userId", "firstName lastName email city");
        res.status(200).json(shops);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Shop by ID (Public)
export const getShopById = async (req, res) => {
    try {
        const shop = await ShopDetails.findById(req.params.id).populate("userId", "firstName lastName email city");
        if (!shop) {
            return res.status(404).json({ message: "Shop not found" });
        }

        // Record view if user is logged in
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            try {
                const token = authHeader.split(" ")[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const userId = decoded.id;

                if (userId) {
                    await User.findByIdAndUpdate(userId, {
                        $pull: { recentlyViewedShops: shop._id }, // Remove if already exists (to move to front)
                    });
                    await User.findByIdAndUpdate(userId, {
                        $push: {
                            recentlyViewedShops: {
                                $each: [shop._id],
                                $position: 0,
                                $slice: 10, // Keep last 10
                            },
                        },
                    });
                }
            } catch (err) {
                // Ignore JWT errors, just don't record view
                console.log("Soft auth failed for view recording:", err.message);
            }
        }

        res.status(200).json(shop);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Recently Viewed Shops
export const getRecentlyViewedShops = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate({
            path: "recentlyViewedShops",
            populate: {
                path: "userId",
                select: "firstName lastName email city",
            },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user.recentlyViewedShops);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

