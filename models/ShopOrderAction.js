import mongoose from "mongoose";

const shopOrderActionSchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },
        shop: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // The shop owner performing the action
            required: true,
        },
        action: {
            type: String,
            enum: ["Accept", "Reject"],
            required: true,
        },
        reason: {
            type: String, // Compulsory or optional reason for rejection
            trim: true,
        },
    },
    { timestamps: true, versionKey: false }
);

export default mongoose.model("ShopOrderAction", shopOrderActionSchema);
