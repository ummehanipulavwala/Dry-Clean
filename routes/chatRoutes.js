import express from "express";
import { sendMessage, getMessages, getMyChats, } from "../controllers/chatController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/message", authMiddleware, sendMessage);
router.get("/messages/:chatId", authMiddleware, getMessages);
router.get("/", authMiddleware, getMyChats);

export default router;
