import Feedback from "../models/Feedback.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";
import { dispatchNotification } from "../utils/notificationDispatcher.js";
import User from "../models/User.js";

// Create Feedback
export const createFeedback = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const userId = req.user.id;

        if (!rating || !comment) {
            return sendError(res, 400, "Rating and comment are required");
        }

        const feedback = await Feedback.create({
            userId,
            rating,
            comment,
        });

        // Notify Admins about new feedback (asynchronous)
        User.find({ role: "Admin" }).then(admins => {
            admins.forEach(admin => {
                dispatchNotification({
                    req,
                    recipientId: admin._id,
                    type: "NEW_FEEDBACK",
                    message: `New feedback received: ${rating} stars.`,
                    referenceId: feedback._id,
                });
            });
        });

        sendSuccess(res, 201, "Feedback submitted successfully", feedback);
    } catch (error) {
        sendError(res, 500, error.message);
    }
};

// Get All Feedbacks
export const getAllFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.find()
            .populate("userId", "name firstName lastName profileImage")
            .sort({ createdAt: -1 });

        sendSuccess(res, 200, "Feedbacks fetched successfully", feedbacks);
    } catch (error) {
        sendError(res, 500, error.message);
    }
};
