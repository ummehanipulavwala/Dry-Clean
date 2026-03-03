import Feedback from "../models/Feedback.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";

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
