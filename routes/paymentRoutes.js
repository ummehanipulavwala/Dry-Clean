import express from "express";
import { getAllPayments, createPayment, getPaymentByOrder, updateSettlementStatus, deletePayment } from "../controllers/paymentController.js";
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, authorizeRoles("Admin"), getAllPayments);
router.post("/", authMiddleware, createPayment);
router.get("/order/:orderId", authMiddleware, getPaymentByOrder);
router.patch("/:id/settlement", authMiddleware, authorizeRoles("Admin"), updateSettlementStatus);
router.delete("/:id", authMiddleware, authorizeRoles("Admin"), deletePayment);

export default router;
