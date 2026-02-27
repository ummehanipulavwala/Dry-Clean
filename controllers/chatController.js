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
    const date = now.toLocaleDateString('en-GB').replace(/\//g, '-'); // DD-MM-YYYY
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

// edit message
export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;

    if (!text) {
      return sendError(res, 400, "Text is required");
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return sendError(res, 404, "Message not found");
    }

    if (message.sender.toString() !== req.user.id.toString()) {
      return sendError(res, 403, "You can only edit your own messages");
    }

    message.text = text;
    await message.save();

    // Update lastMessage in chat if this was the latest message
    const latestMessage = await Message.findOne({ chatId: message.chatId }).sort({ createdAt: -1 });
    if (latestMessage && latestMessage._id.toString() === messageId) {
      await Chat.findByIdAndUpdate(message.chatId, { lastMessage: text });
    }

    sendSuccess(res, 200, "Message updated", message);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// delete message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return sendError(res, 404, "Message not found");
    }

    if (message.sender.toString() !== req.user.id.toString()) {
      return sendError(res, 403, "You can only delete your own messages");
    }

    const chatId = message.chatId;

    await Message.findByIdAndDelete(messageId);

    // Update lastMessage in chat
    const latestMessage = await Message.findOne({ chatId }).sort({ createdAt: -1 });
    if (latestMessage) {
      await Chat.findByIdAndUpdate(chatId, { lastMessage: latestMessage.text });
    } else {
      await Chat.findByIdAndUpdate(chatId, { lastMessage: "" });
    }

    sendSuccess(res, 200, "Message deleted", { messageId });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;

    // Update all messages in this chat that were NOT sent by the current user to be read
    const result = await Message.updateMany(
      {
        chatId,
        sender: { $ne: req.user.id },
        isRead: false
      },
      {
        $set: { isRead: true }
      }
    );

    sendSuccess(res, 200, "Messages marked as read", {
      chatId,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

