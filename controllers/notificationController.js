import Notification from "../models/Notification.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";

// Fetch notifications for the logged-in user
export const getUserNotifications = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const filter = { recipient: req.user.id };

        const totalNotifications = await Notification.countDocuments(filter);
        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const unreadCount = await Notification.countDocuments({
            recipient: req.user.id,
            isRead: false,
        });

        const totalPages = Math.ceil(totalNotifications / limit);

        sendSuccess(res, 200, "Notifications fetched successfully", {
            notifications,
            unreadCount,
            pagination: {
                totalNotifications,
                totalPages,
                currentPage: page,
                limit,
            },
        });
    } catch (error) {
        sendError(res, 500, error.message);
    }
};

// Get just the unread count (for quick polling/badges)
export const getUnreadCount = async (req, res) => {
    try {
        const unreadCount = await Notification.countDocuments({
            recipient: req.user.id,
            isRead: false,
        });

        sendSuccess(res, 200, "Unread count fetched successfully", {
            unreadCount,
        });
    } catch (error) {
        sendError(res, 500, error.message);
    }
};

// Mark a specific notification as read
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, recipient: req.user.id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return sendError(res, 404, "Notification not found or unauthorized");
        }

        sendSuccess(res, 200, "Notification marked as read", notification);
    } catch (error) {
        sendError(res, 500, error.message);
    }
};

// Mark all notifications for the user as read
export const markAllAsRead = async (req, res) => {
    try {
        const result = await Notification.updateMany(
            { recipient: req.user.id, isRead: false },
            { isRead: true }
        );

        sendSuccess(res, 200, "All notifications marked as read", {
            modifiedCount: result.modifiedCount,
        });
    } catch (error) {
        sendError(res, 500, error.message);
    }
};
