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
    { timestamps: true, versionKey: false }
);

export default mongoose.model("ShopDetails", shopDetailsSchema);
