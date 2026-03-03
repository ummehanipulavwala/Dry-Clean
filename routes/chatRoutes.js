import express from "express";
import { sendMessage, getMessages, getMyChats, editMessage, deleteMessage, markMessagesAsRead, clearChat, getChatHistory, getChatsForUser } from "../controllers/chatController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/message", authMiddleware, sendMessage);
router.put("/message/:messageId", authMiddleware, editMessage);
router.delete("/message/:messageId", authMiddleware, deleteMessage);
router.delete("/clear/:chatId", authMiddleware, clearChat);
router.put("/messages/read/:chatId", authMiddleware, markMessagesAsRead);
router.get("/messages/:chatId", authMiddleware, getMessages);
router.get("/history/:partnerId", authMiddleware, getChatHistory);
router.get("/getchats", authMiddleware, getChatsForUser);
router.get("/", authMiddleware, getMyChats);

export default router;
