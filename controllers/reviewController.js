import ShopDetails from "../models/Shopdetails.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";
<<<<<<< HEAD
import { dispatchNotification } from "../utils/notificationDispatcher.js";
=======
>>>>>>> c14c409 (order calculate payment)

// Add a review for a shop
export const addReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const { shopId, description } = req.body;

        if (!shopId || !description) {
            return sendError(res, 400, "shopId and description are required");
        }

        // Check shop exists
        const shop = await ShopDetails.findById(shopId);
        if (!shop) {
            return sendError(res, 404, "Shop not found");
        }

        shop.reviews.push({ userId, shopId, description });
        await shop.save();

        const updatedShop = await ShopDetails.findById(shopId).populate("reviews.userId", "firstName lastName");
        const addedReview = updatedShop.reviews[updatedShop.reviews.length - 1];

<<<<<<< HEAD
        // Notify Shop Owner about the new review
        dispatchNotification({
            req,
            recipientId: shop.userId,
            type: "NEW_REVIEW",
            message: `You have received a new review: "${description.substring(0, 30)}..."`,
            referenceId: shopId,
        });

=======
>>>>>>> c14c409 (order calculate payment)
        sendSuccess(res, 201, "Review added successfully", addedReview);
    } catch (error) {
        sendError(res, 500, error.message);
    }
};

// Get all reviews for a shop
export const getShopReviews = async (req, res) => {
    try {
        const { shopId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const shop = await ShopDetails.findById(shopId).populate("reviews.userId", "firstName lastName profileImage");
        if (!shop) {
            return sendError(res, 404, "Shop not found");
        }

        const total = shop.reviews.length;
        const totalPages = Math.ceil(total / limit);

        // Sort reviews descending by createdAt
        const sortedReviews = shop.reviews.sort((a, b) => b.createdAt - a.createdAt);
        const paginatedReviews = sortedReviews.slice(skip, skip + limit);

        sendSuccess(res, 200, "Reviews fetched successfully", {
            reviews: paginatedReviews,
            pagination: { total, page, limit, totalPages },
        });
    } catch (error) {
        sendError(res, 500, error.message);
    }
};

// Get my reviews (by logged-in user)
export const getMyReviews = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Find all shops that contain a review by this user
        const shops = await ShopDetails.find({ "reviews.userId": userId }).select("shopName shopImage reviews");

        let userReviews = [];
        shops.forEach((shop) => {
            shop.reviews.forEach((review) => {
                if (review.userId.toString() === userId.toString()) {
                    userReviews.push({
                        ...review.toObject(),
                        shopId: {
                            _id: shop._id,
                            shopName: shop.shopName,
                            shopImage: shop.shopImage
                        }
                    });
                }
            });
        });

        const total = userReviews.length;
        const totalPages = Math.ceil(total / limit);

        userReviews.sort((a, b) => b.createdAt - a.createdAt);
        const paginatedReviews = userReviews.slice(skip, skip + limit);

        sendSuccess(res, 200, "My reviews fetched successfully", {
            reviews: paginatedReviews,
            pagination: { total, page, limit, totalPages },
        });
    } catch (error) {
        sendError(res, 500, error.message);
    }
};

// Update a review (only by the owner)
export const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { description } = req.body;

        if (!description) {
            return sendError(res, 400, "description is required");
        }

        const shop = await ShopDetails.findOne({ "reviews._id": id });
        if (!shop) {
            return sendError(res, 404, "Review not found");
        }

        const review = shop.reviews.id(id);
<<<<<<< HEAD

=======
        
>>>>>>> c14c409 (order calculate payment)
        if (review.userId.toString() !== req.user.id.toString()) {
            return sendError(res, 403, "You can only edit your own reviews");
        }

        review.description = description;
        review.updatedAt = Date.now();
        await shop.save();

        sendSuccess(res, 200, "Review updated successfully", review);
    } catch (error) {
        sendError(res, 500, error.message);
    }
};

// Delete a review (by owner or admin)
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        const shop = await ShopDetails.findOne({ "reviews._id": id });
        if (!shop) {
            return sendError(res, 404, "Review not found");
        }

        const review = shop.reviews.id(id);

        const isOwner = review.userId.toString() === req.user.id.toString();
        const isAdmin = req.user.role === "Admin";

        if (!isOwner && !isAdmin) {
            return sendError(res, 403, "Not authorized to delete this review");
        }

        // Remove the review from the array
        shop.reviews.pull({ _id: id });
        await shop.save();

        sendSuccess(res, 200, "Review deleted successfully");
    } catch (error) {
        sendError(res, 500, error.message);
    }
};
