import mongoose from "mongoose";

const shopDetailsSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true, // One shop profile per user
        },
        shopName: {
            type: String,
            required: true,
            trim: true,
        },
        shopAddress: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        shopRatings: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        shopImage: {
            type: String, // URL/Path to image
            default: "",
        },
        pincode: {
            type: String,
            trim: true,
        },
        location: {
            type: String,
            trim: true,
        },
        commissionPercentage: {
            type: Number,
            default: 0,
        },
        services: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
        }],
        status: {
            type: String,
            enum: ["available", "unavailable"],
            default: "available",
        },
        reviews: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                shopId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Shop",
                    required: true,
                },
                description: {
                    type: String,
                    required: true,
                    trim: true,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
                updatedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
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

export default mongoose.model("ShopDetails", shopDetailsSchema);
