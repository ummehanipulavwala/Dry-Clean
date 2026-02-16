import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        shop: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Reference to the user who owns the shop
            required: true,
        },
        items: [
            {
                service: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Service",
                    required: true,
                },
                itemName: {
                    type: String,
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    default: 1,
                },
                price: {
                    type: Number,
                    required: true,
                },
                finalPrice: {
                    type: Number,
                    required: true,
                    min: 0,
                },
            },
        ],
        pickupAddress: {
            type: String,
            required: true,
        },
        deliveryAddress: {
            type: String,
            required: true,
        },
        pickupSchedule: {
            date: {
                type: Date,
                required: true,
            },
            timeSlot: {
                type: String, // e.g., "10:00 AM - 12:00 PM"
            },
        },
        orderStatus: {
            type: String,
            enum: [
                "Pending",
                "Pickup Done",
                "Delivered",
                "Cancelled",
            ],
            default: "Pending",
        },
        totalAmount: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true, versionKey: false }
);

export default mongoose.model("Order", orderSchema);
