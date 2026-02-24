import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        shopId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ShopDetails",
            required: true,
        },
        paymentMethod: {
            type: String,
            enum: ["COD"],
            default: "COD",
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        discountAmount: {
            type: Number,
            default: 0,
        },
        finalAmount: {
            type: Number,
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ["Pending", "Collected"],
            default: "Pending",
        },
        paymentCollectedAt: {
            type: Date,
        },
        platformCommissionPercent: {
            type: Number,
            default: 10,
        },
        platformCommissionAmount: {
            type: Number,
        },
        shopAmount: {
            type: Number,
        },
        settlementStatus: {
            type: String,
            enum: ["Pending", "Settled"],
            default: "Pending",
        },
        settlementDate: {
            type: Date,
        },
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: {
            transform: (doc, ret) => {
                if (ret.paymentCollectedAt) {
                    const d = new Date(ret.paymentCollectedAt);
                    ret.paymentCollectedAt = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
                }
                if (ret.settlementDate) {
                    const d = new Date(ret.settlementDate);
                    ret.settlementDate = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
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

export default mongoose.model("Payment", paymentSchema);
