import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Can be a customer or shop owner
            required: true,
        },
        type: {
            type: String,
            enum: [
                "ORDER_PLACED",
                "ORDER_ACCEPTED",
                "ORDER_REJECTED",
                "DELIVERY_ASSIGNED",
                "PAYMENT_RECEIVED",
                "NEW_REVIEW",
                "ORDER_UPDATED",
                "NEW_FEEDBACK",
                "GENERAL",
            ],
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        referenceId: {
            type: mongoose.Schema.Types.ObjectId,
            // Can reference Order, Payment, etc.
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
