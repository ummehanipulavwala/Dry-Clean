import ShopDetails from "../models/Shopdetails.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Service from "../models/servicemodel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendSuccess, sendError } from "../utils/responseHandler.js";


// Create Shop Details
export const createShopDetails = async (req, res) => {
    try {
        const { shopName, shopAddress, shopRatings, status } = req.body;
        const userId = req.user.id;

        // Check if shop details already exist for this user
        const existingShop = await ShopDetails.findOne({ userId });
        if (existingShop) {
            return sendError(res, 400, "Shop details already exist");
        }

        const shopImage = req.file ? `/uploads/profiles/${req.file.filename}` : "";

        const user = await User.findById(userId);

        const shopDetails = await ShopDetails.create({
            userId,
            shopName,
            shopAddress,
            phone: user?.phone || "0000000000", // Fallback if user somehow lacks a phone
            shopRatings: shopRatings || 0,
            shopImage,
            status: status || "available",
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
        const { shopName, shopAddress, shopRatings, status } = req.body;
        const userId = req.user.id;
        const user = await User.findById(userId);

        let updateData = {
            ...(shopName && { shopName }),
            ...(shopAddress && { shopAddress }),
            ...(shopRatings && { shopRatings }),
            ...(status && { status }),
            ...(user?.phone && { phone: user.phone }),
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
        const shop = await ShopDetails.findById(req.params.id)
            .populate("userId", "firstName lastName email city")
            .populate("services");
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

// Get All Shops for Admin Dashboard
export const getAdminShops = async (req, res) => {
    try {
        const shops = await ShopDetails.find()
            .populate("userId", "firstName lastName name email phone status")
            .populate("services");

        const enrichedShops = await Promise.all(
            shops.map(async (shop) => {
                const user = shop.userId;
                if (!user) return null;

                // Fetch total orders for this shop
                const totalOrders = await Order.countDocuments({ shop: user._id });

                return {
                    id: shop._id,
                    shopName: shop.shopName,
                    ownerName: user.name || `${user.firstName} ${user.lastName}`,
                    phone: user.phone,
                    email: user.email,
                    shopAddress: shop.shopAddress,
                    pincode: shop.pincode || "N/A",
                    location: shop.location || "N/A",
                    status: user.status || "Active",
                    commissionPercentage: shop.commissionPercentage || 0,
                    totalOrders: totalOrders,
                    services: shop.services || []
                };
            })
        );

        // Filter out nulls in case of dangling shop details
        const filteredShops = enrichedShops.filter(s => s !== null);

        sendSuccess(res, 200, "Admin shops fetched successfully", filteredShops);
    } catch (error) {
        sendError(res, 500, error.message);
    }
};

// Admin Create Shop (User + ShopDetails)
export const adminCreateShop = async (req, res) => {
    try {
        const {
            email,
            password,
            ownerName,
            phone,
            shopName,
            shopAddress,
            pincode,
            location,
            commissionPercentage,
            services
        } = req.body;

        if (!email || !password || !shopName || !ownerName || !phone) {
            return sendError(res, 400, "Required fields: email, password, shopName, ownerName, phone");
        }

        // 1. Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return sendError(res, 400, "Email already registered");
        }

        // 2. Create User with role "Shop"
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            email,
            password: hashedPassword,
            name: ownerName,
            phone,
            role: "Shop",
            status: "Active"
        });

        // 3. Create Shop Details linked to this user
        const shopDetails = await ShopDetails.create({
            userId: newUser._id,
            shopName,
            phone,
            shopAddress: shopAddress || "",
            pincode: pincode || "",
            location: location || "",
            commissionPercentage: commissionPercentage || 0,
            shopRatings: 0,
            shopImage: "",
            services: services || []
        });

        sendSuccess(res, 201, "Shop and User created successfully", {
            userId: newUser._id,
            shopId: shopDetails._id
        });
    } catch (error) {
        sendError(res, 500, error.message);
    }
};

// Admin Update Shop (Updates both User and ShopDetails)
export const adminUpdateShop = async (req, res) => {
    try {
        const { id } = req.params; // ShopDetails ID
        const {
            shopName,
            ownerName,
            phone,
            email,
            shopAddress,
            pincode,
            location,
            status,
            commissionPercentage,
            services
        } = req.body;

        const shop = await ShopDetails.findById(id);
        if (!shop) {
            return sendError(res, 404, "Shop details not found");
        }

        // 1. Update ShopDetails
        const updatedShop = await ShopDetails.findByIdAndUpdate(
            id,
            {
                $set: {
                    ...(shopName && { shopName }),
                    ...(phone && { phone }),
                    ...(shopAddress && { shopAddress }),
                    ...(pincode && { pincode }),
                    ...(location && { location }),
                    ...(commissionPercentage !== undefined && { commissionPercentage }),
                    ...(services && { services }),
                }
            },
            { new: true }
        );

        // 2. Update associated User
        await User.findByIdAndUpdate(shop.userId, {
            $set: {
                ...(ownerName && { name: ownerName }),
                ...(phone && { phone }),
                ...(email && { email }),
                ...(status && { status }),
            }
        });

        sendSuccess(res, 200, "Shop updated successfully", updatedShop);
    } catch (error) {
        sendError(res, 500, error.message);
    }
};

// Admin Delete Shop (Deletes both User and ShopDetails)
export const adminDeleteShop = async (req, res) => {
    try {
        const { id } = req.params; // ShopDetails ID
        const shop = await ShopDetails.findById(id);

        if (!shop) {
            return sendError(res, 404, "Shop not found");
        }

        // Delete ShopDetails
        await ShopDetails.findByIdAndDelete(id);

        // Delete associated User
        await User.findByIdAndDelete(shop.userId);

        sendSuccess(res, 200, "Shop and associated user deleted successfully");
    } catch (error) {
        sendError(res, 500, error.message);
    }
};
