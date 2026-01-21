import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    dob: {
      type: Date,
      required: true
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true
    },
    role: {
      type: String,
      enum: ["User", "Admin", "Shop"],
      default: "User"
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\S+$/, "Spaces not allowed"]
    },
    password: {
      type: String,
      required: true,
      match: [/^\S+$/, "Spaces not allowed"]
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    recentSearches: {
    type: [String],
    default: []
  }
},
  { timestamps: true }
);

export default mongoose.model("User", userSchema);