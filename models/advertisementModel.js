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
}, {
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
});

const Advertisement = mongoose.model("Advertisement", advertisementSchema);

export default Advertisement;
