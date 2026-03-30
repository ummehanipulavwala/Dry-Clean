import express from 'express';
import {
    createOrder, getMyOrders, respondToOrder, getAllOrders,
<<<<<<< HEAD
    getShopOrderStats, getAllRequests, updateOrder, deleteOrder,
    assignDeliveryAndNotify
=======
    getShopActiveOrders, getAllRequests, updateOrder, deleteOrder,
    assignDeliveryAndNotify, calculatePrice
>>>>>>> c14c409 (order calculate payment)
} from "../controllers/orderController.js";
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createOrder);
<<<<<<< HEAD
router.get("/OrderHistory", authMiddleware, getMyOrders);
router.get("/all", authMiddleware, getAllRequests); // Using getAllRequests for the 'All' view
router.get("/shop/stats", authMiddleware, getShopOrderStats);
=======
router.post("/calculate-price", authMiddleware, calculatePrice);
router.get("/OrderHistory", authMiddleware, getMyOrders);
router.get("/all", authMiddleware, getAllOrders);
router.get("/shop/active", authMiddleware, getShopActiveOrders);
>>>>>>> c14c409 (order calculate payment)
router.put("/action", authMiddleware, respondToOrder);
router.get("/requests", authMiddleware, getAllRequests);

// Admin operations
router.put("/assign-delivery", authMiddleware, authorizeRoles("Admin"), assignDeliveryAndNotify);
router.put("/:id", authMiddleware, authorizeRoles("Admin"), updateOrder);
router.delete("/:id", authMiddleware, authorizeRoles("Admin"), deleteOrder);

export default router;
