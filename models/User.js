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
<<<<<<< HEAD
      type: String,
      match: [/^\d{10}$/, "Phone number must be exactly 10 digits"]
=======
      type: Number,
      match: [/^[6-9]\d{9}$/, "10 digit valid Indian number"]
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
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
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("User", userSchema);