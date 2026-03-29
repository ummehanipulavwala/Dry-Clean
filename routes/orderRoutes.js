import express from 'express';
import {
    createOrder, getMyOrders, respondToOrder, getAllOrders,
    getShopOrderStats, getAllRequests, updateOrder, deleteOrder,
    assignDeliveryAndNotify
} from "../controllers/orderController.js";
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createOrder);
router.get("/OrderHistory", authMiddleware, getMyOrders);
router.get("/all", authMiddleware, getAllRequests); // Using getAllRequests for the 'All' view
router.get("/shop/stats", authMiddleware, getShopOrderStats);
router.put("/action", authMiddleware, respondToOrder);
router.get("/requests", authMiddleware, getAllRequests);

// Admin operations
router.put("/assign-delivery", authMiddleware, authorizeRoles("Admin"), assignDeliveryAndNotify);
router.put("/:id", authMiddleware, authorizeRoles("Admin"), updateOrder);
router.delete("/:id", authMiddleware, authorizeRoles("Admin"), deleteOrder);

export default router;
