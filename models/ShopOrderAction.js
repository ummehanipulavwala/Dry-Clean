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
    {
        timestamps: true,
        versionKey: false,
        toJSON: {
            transform: (doc, ret) => {
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

export default mongoose.model("ShopOrderAction", shopOrderActionSchema);
