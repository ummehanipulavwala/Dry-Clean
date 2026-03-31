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

        const shopImage = req.files && req.files.length > 0
            ? `/uploads/profiles/${req.files[0].filename}`
            : req.file
                ? `/uploads/profiles/${req.file.filename}`
                : "";

        const user = await User.findById(userId);

        const shopDetails = await ShopDetails.create({
            userId,
            shopName,
            shopAddress,
            phone: user?.phone || "0000000000",
            shopRatings: shopRatings || 0,
            shopImage,
            status: status || "available",
            services: req.body.services ? req.body.services.filter((v, i, a) => a.findIndex(t => (t.serviceId === v.serviceId)) === i) : []
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

        if (req.files && req.files.length > 0) {
            updateData.shopImage = `/uploads/profiles/${req.files[0].filename}`;
        } else if (req.file) {
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

// Toggle Shop Status (Available/Unavailable)
export const toggleShopStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const shopDetails = await ShopDetails.findOne({ userId });

        if (!shopDetails) {
            return sendError(res, 404, "Shop details not found");
        }

        const newStatus = shopDetails.status === "available" ? "unavailable" : "available";
        shopDetails.status = newStatus;
        await shopDetails.save();

        sendSuccess(res, 200, `Shop status updated to ${newStatus}`, { status: newStatus });
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
            .populate("services.serviceId");
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

        // Flatten services for frontend — with manual fallback for legacy data
        const allServices = await Service.find();
        const serviceMap = {};
        allServices.forEach(svc => { serviceMap[svc._id.toString()] = svc; });

        const flattenedServices = shop.services.map(s => {
            const svc = s.toObject();
            const populated = s.serviceId && typeof s.serviceId === 'object' ? s.serviceId : null;
            const rawId = svc.serviceId?.toString() || svc._id?.toString();
            const fallback = rawId ? serviceMap[rawId] : null;
            const resolved = populated || fallback;
            return {
                ...svc,
                name: resolved?.name || svc.name || "Unknown Service",
                description: resolved?.description || svc.description || "No description available",
                image: resolved?.image || svc.image || "",
                isActive: resolved?.isActive ?? svc.isActive ?? false,
                category: resolved?.category || svc.category || "General",
                subCategory: resolved?.subCategory || svc.subCategory || "General"
            };
        });

        const shopResponse = {
            ...shop.toObject(),
            services: flattenedServices
        };

        sendSuccess(res, 200, "Shop details fetched successfully", shopResponse);
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
            .populate("services.serviceId");

        // Load all services once for manual fallback matching
        const allServices = await Service.find();
        const serviceMap = {};
        allServices.forEach(svc => { serviceMap[svc._id.toString()] = svc; });

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
                    services: (shop.services || []).map(s => {
                        const svc = s.toObject ? s.toObject() : s;
                        // Try populated ref first, then fall back to manual id match
                        const populated = s.serviceId && typeof s.serviceId === 'object' ? s.serviceId : null;
                        const rawId = svc.serviceId?.toString() || svc._id?.toString();
                        const fallback = rawId ? serviceMap[rawId] : null;
                        const resolved = populated || fallback;
                        return {
                            ...svc,
                            name: resolved?.name || svc.name || "Unknown Service",
                            description: resolved?.description || svc.description || "No description available",
                            image: resolved?.image || svc.image || "",
                            isActive: resolved?.isActive ?? svc.isActive ?? false
                        };
                    })
                };
            })
        );

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
            services: services ? [...new Set(services)].map(serviceId => ({
                serviceId,
                price: 0 // Default price to allow successful creation
            })) : []
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
                    ...(services && {
                        services: [...new Set(services)].map(serviceId => ({
                            serviceId,
                            price: 0 // Default price for newly added services
                        }))
                    }),
                }
            },
            { new: true }
        ).populate("services.serviceId");

        // 2. Update associated User
        await User.findByIdAndUpdate(shop.userId, {
            $set: {
                ...(ownerName && { name: ownerName }),
                ...(phone && { phone }),
                ...(email && { email }),
                ...(status && { status }),
            }
        });

        // Flatten services for response
        const flattenedShop = {
            ...updatedShop.toObject(),
            services: updatedShop.services.map(s => {
                const svc = s.toObject();
                return {
                    ...svc,
                    name: s.serviceId?.name || svc.name || "Unknown Service",
                    description: s.serviceId?.description || svc.description || "No description available",
                    image: s.serviceId?.image || svc.image || "",
                    isActive: s.serviceId?.isActive ?? svc.isActive ?? false
                };
            })
        };

        sendSuccess(res, 200, "Shop updated successfully", flattenedShop);
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
