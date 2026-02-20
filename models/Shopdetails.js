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
