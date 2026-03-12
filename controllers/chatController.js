import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import ShopDetails from "../models/Shopdetails.js";
import User from "../models/User.js";
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

// clear all chats between sender and reciever (by chatId)
export const clearChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    // Check if user is part of the chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return sendError(res, 404, "Chat not found");
    }

    if (!chat.members.includes(req.user.id)) {
      return sendError(res, 403, "You are not a member of this chat");
    }

    // Delete all messages in the chat
    await Message.deleteMany({ chatId });

    // Update lastMessage in chat
    await Chat.findByIdAndUpdate(chatId, { lastMessage: "" });

    sendSuccess(res, 200, "Chat cleared", { chatId });
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

// get chat history between current user and partner
export const getChatHistory = async (req, res) => {
  try {
    const { partnerId } = req.params;

    if (!partnerId) {
      return sendError(res, 400, "Partner ID is required");
    }

    // Find if a chat exists between these two members
    const chat = await Chat.findOne({
      members: { $all: [req.user.id, partnerId] },
    });

    if (!chat) {
      return sendSuccess(res, 200, "No chat history found", []);
    }

    // Fetch messages for this chat
    const messages = await Message.find({ chatId: chat._id })
      .populate("sender", "firstName lastName role")
      .sort({ createdAt: 1 });

    sendSuccess(res, 200, "Chat history fetched", messages);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// get chats for user with shop details and unread count
export const getChatsForUser = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all chats the user is a member of
    const chats = await Chat.find({
      members: { $in: [userId] },
    }).sort({ updatedAt: -1 });

    const enrichedChats = await Promise.all(
      chats.map(async (chat) => {
        // Find the other member (partner)
        const partnerId = chat.members.find(
          (id) => id.toString() !== userId.toString()
        );

        if (!partnerId) return null;

        // Fetch user details for the partner
        const partnerUser = await User.findById(partnerId);

        // Fetch shop details for the partner if they have any
        const shop = await ShopDetails.findOne({ userId: partnerId });

        // Fetch only the most recent message for the chat list summary
        const recentMessageDoc = await Message.findOne({ chatId: chat._id }).sort({ createdAt: -1 });

        // Count unread messages (sent by the other user)
        const unreadCount = await Message.countDocuments({
          chatId: chat._id,
          sender: partnerId,
          isRead: false,
        });

        // Determine display name and image
        let displayName = "Unknown User";
        let displayImage = "";
        let role = "User";

        if (shop && shop.shopName) {
          displayName = shop.shopName;
          displayImage = shop.shopImage || "";
          role = "Shop";
        } else if (partnerUser) {
          displayName = partnerUser.firstName ? `${partnerUser.firstName} ${partnerUser.lastName}`.trim() : partnerUser.name || "User";
          displayImage = partnerUser.profileImage || "";
          role = partnerUser.role || "User";
        }

        return {
          chatId: chat._id,
          partnerId: partnerId,
          role: role,
          shopname: displayName,
          shopimage: displayImage,
          recentMessage: recentMessageDoc ? recentMessageDoc.text : "",
          time: recentMessageDoc ? recentMessageDoc.time : "",
          date: recentMessageDoc ? recentMessageDoc.date : "",
          unreadCount: unreadCount,
        };
      })
    );

    // Filter out nulls (in case partnerId wasn't found)
    const filteredChats = enrichedChats.filter((chat) => chat !== null);

    sendSuccess(res, 200, "Chats fetched successfully", filteredChats);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
