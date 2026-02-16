import mongoose from "mongoose";

const advertisementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true, versionKey: false});

const Advertisement = mongoose.model("Advertisement", advertisementSchema);

export default Advertisement;
