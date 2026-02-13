import express from "express";
import { createOrder, getMyOrders, respondToOrder } from "../controllers/orderController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createOrder);
router.get("/OrderHistory", authMiddleware, getMyOrders);
router.put("/action", authMiddleware, respondToOrder);

export default router;
