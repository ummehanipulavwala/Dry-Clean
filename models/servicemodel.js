import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // No duplicate services
      trim: true,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: String,
    image: {
      type: String, // image path or URL
    },
    price: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    category: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Service", serviceSchema);
