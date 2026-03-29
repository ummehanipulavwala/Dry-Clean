import Notification from "../models/Notification.js";
import { sendSMS } from "./twilioService.js";

/**
 * Dispatch a notification across multiple channels (DB, Socket.io, and SMS)
 * 
 * @param {Object} options
 * @param {import("express").Request} [options.req] - Express request object (to access io)
 * @param {Object} [options.io] - Direct Socket.io instance
 * @param {string} options.recipientId - ID of the user receiving the notification
 * @param {string} options.type - Enum type of notification (e.g. 'ORDER_ACCEPTED')
 * @param {string} options.message - The text message body
 * @param {string} [options.referenceId] - Optional ID of the related entity (Order, etc.)
 * @param {Object} [options.sendSmsOpts] - Options to trigger SMS fallback
 * @param {string} options.sendSmsOpts.phone - Recipient phone number for SMS
 */
export const dispatchNotification = async ({
    req,
    io: directIo,
    recipientId,
    type,
    message,
    referenceId,
    sendSmsOpts,
}) => {
    try {
        // 1. Save to Database
        const notification = await Notification.create({
            recipient: recipientId,
            type,
            message,
            referenceId,
        });

        // 2. Emit via Socket.io for Real-time App updates
        const io = directIo || (req && req.app.get("io"));
        if (io) {
            // Get updated unread count to push to the client
            const unreadCount = await Notification.countDocuments({
                recipient: recipientId,
                isRead: false,
            });

            io.to(recipientId.toString()).emit("new_notification", {
                notification,
                unreadCount,
            });
            console.log(`Socket notification emitted to user ${recipientId}`);
        }

        // 3. Send SMS if requested
        if (sendSmsOpts && sendSmsOpts.phone) {
            sendSMS(sendSmsOpts.phone, message).catch((err) => {
                console.error("SMS Dispatch error:", err);
            });
        }

        return notification;
    } catch (error) {
        console.error("Notification Dispatch Error:", error.message);
        // We don't throw here to avoid breaking the main business logic
        return null;
    }
};
