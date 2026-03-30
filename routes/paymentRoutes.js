import express from "express";
import { getAllPayments, createPayment, getPaymentByOrder } from "../controllers/paymentController.js";
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, authorizeRoles("Admin"), getAllPayments);
router.post("/", authMiddleware, createPayment);
router.get("/order/:orderId", authMiddleware, getPaymentByOrder);

export default router;
