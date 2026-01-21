import Chat from "../models/Chat.js";
import Message from "../models/Message.js";

/**
 * Create or Get Chat
 */
export const accessChat = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "UserId required" });
    }

    let chat = await Chat.findOne({
      members: { $all: [req.user.id, userId] },
    }).populate("members", "firstName lastName role");

    if (!chat) {
      chat = await Chat.create({
        members: [req.user.id, userId],
      });
    }

    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Send Message
 */
export const sendMessage = async (req, res) => {
  try {
    const { chatId, text } = req.body;

    if (!chatId || !text) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const message = await Message.create({
      chatId,
      sender: req.user.id,
      text,
    });

    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: text,
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get All Messages (Continuous Chat)
 */
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({ chatId })
      .populate("sender", "firstName lastName role")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get All Chats (Recent Chats)
 */
export const getMyChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      members: { $in: [req.user.id] },
    })
      .populate("members", "firstName lastName role")
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
