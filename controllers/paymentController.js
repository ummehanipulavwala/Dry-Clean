import Payment from "../models/Payment.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";

// Get all payments for admin
export const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate("userId", "firstName lastName email phone")
            .populate("shopId", "shopName shopAddress")
            .populate("orderId")
            .sort({ createdAt: -1 });

        sendSuccess(res, 200, "All payments fetched successfully", payments);
    } catch (error) {
        sendError(res, 500, "Failed to fetch payments", error.message);
    }
};

// Create new payment record
export const createPayment = async (req, res) => {
    try {
        const {
            orderId,
            userId,
            shopId,
            paymentMethod,
            totalAmount,
            discountAmount,
            finalAmount,
            paymentStatus,
            paymentCollectedAt,
            platformCommissionPercent
        } = req.body;

        // Validate required fields
        if (!orderId || !userId || !shopId || !finalAmount) {
            return sendError(res, 400, "Required fields missing (orderId, userId, shopId, finalAmount)");
        }

        // Default commission percent to 10 if not provided
        const commissionPercent = platformCommissionPercent || 10;

        // Calculate commission and shop amount
        const platformCommissionAmount = (finalAmount * commissionPercent) / 100;
        const shopAmount = finalAmount - platformCommissionAmount;

        const newPayment = new Payment({
            orderId,
            userId,
            shopId,
            paymentMethod: paymentMethod || "COD",
            totalAmount: totalAmount || finalAmount,
            discountAmount: discountAmount || 0,
            finalAmount,
            paymentStatus: paymentStatus || "Pending",
            paymentCollectedAt,
            platformCommissionPercent: commissionPercent,
            platformCommissionAmount,
            shopAmount,
            settlementStatus: "Pending"
        });

        await newPayment.save();

        sendSuccess(res, 201, "Payment details added successfully", newPayment);
    } catch (error) {
        sendError(res, 500, "Failed to add payment details", error.message);
    }
};
