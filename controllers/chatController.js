import Chat from "../models/Chat.js";
import Message from "../models/Message.js";

//send message
export const sendMessage = async (req, res) => {
  try {
    const { userId, text } = req.body;

    if (!text || !userId) {
      return res.status(400).json({ success: false, message: "Text and userId are required" });
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

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//get messages
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({ chatId })
      .populate("sender", "firstName lastName role")
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

    res.status(200).json({ success: true, data: chats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
