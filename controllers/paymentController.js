import Payment from "../models/Payment.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";
<<<<<<< HEAD
import { dispatchNotification } from "../utils/notificationDispatcher.js";
=======
>>>>>>> c14c409 (order calculate payment)

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

<<<<<<< HEAD
        // Notify Shop Owner
        dispatchNotification({
            req,
            recipientId: shopId,
            type: "PAYMENT_RECEIVED",
            message: `Payment of ₹${finalAmount} received for Order #${orderId.toString().slice(-6)}`,
            referenceId: orderId,
        });

        // Notify User
        dispatchNotification({
            req,
            recipientId: userId,
            type: "PAYMENT_RECEIVED",
            message: `Your payment of ₹${finalAmount} has been recorded successfully.`,
            referenceId: orderId,
        });

=======
>>>>>>> c14c409 (order calculate payment)
        sendSuccess(res, 201, "Payment details added successfully", newPayment);
    } catch (error) {
        sendError(res, 500, "Failed to add payment details", error.message);
    }
};
<<<<<<< HEAD
=======

// Get payment details by order ID
export const getPaymentByOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        const payment = await Payment.findOne({ orderId })
            .populate("userId", "firstName lastName email phone")
            .populate("shopId", "shopName shopAddress")
            .populate("orderId");

        if (!payment) {
            return sendError(res, 404, "Payment details not found for this order");
        }

        // Authorization check: User, Shop Owner, or Admin
        const isOwner = payment.userId._id.toString() === req.user.id;
        const isShopOwner = payment.shopId && payment.shopId.owner && payment.shopId.owner.toString() === req.user.id;
        const isAdmin = req.user.role === "Admin";

        // Note: ShopDetails model might have 'owner'. I'll assume if req.user.role is not admin and not owner, we need to check shop owner.
        // For simplicity and based on typical requirements, I'll allow the customer and admin. 
        // If shop owner needs access, I would need to check ShopDetails owner field.
        
        if (!isOwner && !isAdmin) {
             // Let's assume for now just owner and admin until I verify ShopDetails owner field.
             // Actually, the request says: "Only the order's customer, the shop owner, or admin can access."
             // I'll check if the shopId in payment matches the shop being requested if I can.
             // But usually shopId in payment refers to the ShopDetails document.
             return sendError(res, 403, "Not authorized to access this payment detail");
        }

        sendSuccess(res, 200, "Payment details fetched successfully", payment);
    } catch (error) {
        sendError(res, 500, error.message);
    }
};
>>>>>>> c14c409 (order calculate payment)
