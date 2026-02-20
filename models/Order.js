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
    {
        timestamps: true,
        versionKey: false,
        toJSON: {
            transform: (doc, ret) => {
                if (ret.pickupSchedule && ret.pickupSchedule.date) {
                    const d = new Date(ret.pickupSchedule.date);
                    ret.pickupSchedule.date = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
                }
                if (ret.createdAt) {
                    const d = new Date(ret.createdAt);
                    ret.createdAt = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
                }
                if (ret.updatedAt) {
                    const d = new Date(ret.updatedAt);
                    ret.updatedAt = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
                }
                return ret;
            },
        },
    }
);

export default mongoose.model("Order", orderSchema);
