import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    date: {
      type: String,
    },
    time: {
      type: String,
    },
    reciever: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Message", messageSchema);
