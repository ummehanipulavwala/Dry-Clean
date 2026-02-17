import ShopDetails from "../models/Shopdetails.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { sendSuccess, sendError } from "../utils/responseHandler.js";


// Create Shop Details
export const createShopDetails = async (req, res) => {
    try {
        const { shopName, shopAddress, shopRatings } = req.body;
        const userId = req.user.id;

        // Check if shop details already exist for this user
        const existingShop = await ShopDetails.findOne({ userId });
        if (existingShop) {
            return sendError(res, 400, "Shop details already exist");
        }

        const shopImage = req.file ? `/uploads/profiles/${req.file.filename}` : "";

        const shopDetails = await ShopDetails.create({
            userId,
            shopName,
            shopAddress,
            shopRatings: shopRatings || 0,
            shopImage,
        });

        sendSuccess(res, 201, "Shop details created successfully", shopDetails);
    } catch (error) {
        sendError(res, 500, error.message);
    }
};

// Get My Shop Details
export const getMyShopDetails = async (req, res) => {
    try {
        const shopDetails = await ShopDetails.findOne({ userId: req.user.id });

        if (!shopDetails) {
            return sendError(res, 404, "Shop details not found");
        }

        sendSuccess(res, 200, "Shop details fetched successfully", shopDetails);
    } catch (error) {
        sendError(res, 500, error.message);
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
            return sendError(res, 404, "Shop details not found");
        }

        sendSuccess(res, 200, "Shop details updated successfully", shopDetails);
    } catch (error) {
        sendError(res, 500, error.message);
    }
};

// Get All Shops (Public)
export const getAllShops = async (req, res) => {
    try {
        const shops = await ShopDetails.find().populate("userId", "firstName lastName email city");
        sendSuccess(res, 200, "Shops fetched successfully", shops);
    } catch (error) {
        sendError(res, 500, error.message);
    }
};

// Get Shop by ID (Public)
export const getShopById = async (req, res) => {
    try {
        const shop = await ShopDetails.findById(req.params.id).populate("userId", "firstName lastName email city");
        if (!shop) {
            return sendError(res, 404, "Shop not found");
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

        sendSuccess(res, 200, "Shop details fetched successfully", shop);
    } catch (error) {
        sendError(res, 500, error.message);
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
            return sendError(res, 404, "User not found");
        }

        sendSuccess(res, 200, "Recently viewed shops fetched successfully", user.recentlyViewedShops);
    } catch (error) {
        sendError(res, 500, error.message);
    }
};

