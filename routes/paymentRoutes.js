import express from "express";
<<<<<<< HEAD
import { getAllPayments, createPayment } from "../controllers/paymentController.js";
=======
import { getAllPayments, createPayment, getPaymentByOrder } from "../controllers/paymentController.js";
>>>>>>> c14c409 (order calculate payment)
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, authorizeRoles("Admin"), getAllPayments);
router.post("/", authMiddleware, createPayment);
<<<<<<< HEAD
=======
router.get("/order/:orderId", authMiddleware, getPaymentByOrder);
>>>>>>> c14c409 (order calculate payment)

export default router;
