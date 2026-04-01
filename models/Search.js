import mongoose from "mongoose";

const searchSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    searchText: {
      type: String,
      required: true,
      trim: true,
    },
    results: {
      services: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Service",
        },
      ],
      shops: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ShopDetails",
        },
      ],
      orders: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Order",
        },
      ],
      users: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      feedback: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Feedback",
        },
      ],
      payments: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Payment",
        },
      ],
      ads: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Advertisement",
        },
      ],
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Search", searchSchema);
