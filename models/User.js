import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    dob: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    role: {
      type: String,
      enum: ["User", "Admin", "Shop"],
      trim: true,
      default: "User"
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
      match: [/^\S+$/, "Spaces not allowed"]
    },
    phone: {
      type: String,
      match: [/^\d{10}$/, "Phone number must be exactly 10 digits"]
    },
    password: {
      type: String,
      required: true,
      trim: true,
      match: [/^\S+$/, "Spaces not allowed"]
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    pincode: {
      type: Number,
      match: [/^[1-9][0-9]{5}$/, "6 digit valid Indian pincode"]
    },
    country: {
      type: String,
    },
    recentSearches: {
      type: [String],
      default: []
    },
    recentlyViewedShops: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ShopDetails",
      },
    ],
    profileImage: {
      type: String
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (doc, ret) => {
        if (ret.dob) {
          const d = new Date(ret.dob);
          ret.dob = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
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

export default mongoose.model("User", userSchema);