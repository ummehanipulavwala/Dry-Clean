import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
<<<<<<< HEAD
      trim: true,
    },
    subCategory: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
=======
      unique: true, // No duplicate services
      trim: true,
    },
>>>>>>> c14c409 (order calculate payment)
    description: String,
    category: {
      type: String,
      required: true,
    },
    image: {
      type: String, // image path or URL
    },
    isActive: {
      type: Boolean,
      default: true,
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

export default mongoose.model("Service", serviceSchema);
