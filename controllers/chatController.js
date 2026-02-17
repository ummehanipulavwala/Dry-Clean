import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";

//send message
export const sendMessage = async (req, res) => {
  try {
    const { userId, text } = req.body;

    if (!text || !userId) {
      return sendError(res, 400, "Text and userId are required");
    }

    let chat = await Chat.findOne({
      members: { $all: [req.user.id, userId] },
    });

    if (!chat) {
      chat = await Chat.create({
        members: [req.user.id, userId],
      });
    }
    const targetChatId = chat._id;

    const now = new Date(); // Using the current time context
    const date = now.toLocaleDateString('en-GB'); // DD/MM/YYYY
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const message = await Message.create({
      chatId: targetChatId,
      sender: req.user.id,
      text,
      date,
      time,
      reciever: userId,
    });

    await Chat.findByIdAndUpdate(targetChatId, {
      lastMessage: text,
    });

    sendSuccess(res, 201, "Message sent", message);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

//get messages
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({ chatId })
      .populate("sender", "firstName lastName role")
      .sort({ createdAt: 1 });

    sendSuccess(res, 200, "Messages fetched", messages);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// get all chats(recent chats)
export const getMyChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      members: { $in: [req.user.id] },
    })
      .populate("members", "firstName lastName role")
      .sort({ updatedAt: -1 });

    sendSuccess(res, 200, "Chats fetched", chats);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
