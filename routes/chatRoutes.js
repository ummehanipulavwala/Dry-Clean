import express from "express";
import { sendMessage, getMessages, getMyChats, editMessage, deleteMessage, markMessagesAsRead } from "../controllers/chatController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/message", authMiddleware, sendMessage);
router.put("/message/:messageId", authMiddleware, editMessage);
router.delete("/message/:messageId", authMiddleware, deleteMessage);
router.put("/messages/read/:chatId", authMiddleware, markMessagesAsRead);
router.get("/messages/:chatId", authMiddleware, getMessages);
router.get("/", authMiddleware, getMyChats);

export default router;
