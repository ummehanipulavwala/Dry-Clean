import express from "express";
import { createOrder, getMyOrders, respondToOrder, getAllOrders, getShopActiveOrders, getAllRequests } from "../controllers/orderController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createOrder);
router.get("/OrderHistory", authMiddleware, getMyOrders);
router.get("/all", authMiddleware, getAllOrders);
router.get("/shop/active", authMiddleware, getShopActiveOrders);
router.put("/action", authMiddleware, respondToOrder);
router.get("/requests", authMiddleware, getAllRequests);

export default router;
