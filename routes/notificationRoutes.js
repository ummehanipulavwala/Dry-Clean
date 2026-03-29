import express from "express";
import {
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
} from "../controllers/notificationController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// All notification routes should be protected
router.use(authMiddleware);

router.get("/", getUserNotifications);
router.get("/unread-count", getUnreadCount);
router.put("/read-all", markAllAsRead);
router.put("/:id/read", markAsRead);

export default router;
