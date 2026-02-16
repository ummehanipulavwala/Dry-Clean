import Order from "../models/Order.js";
import ShopOrderAction from "../models/ShopOrderAction.js";

// Create a new order
export const createOrder = async (req, res) => {
    try {
        const { shop, items, pickupAddress, deliveryAddress, pickupSchedule, totalAmount } = req.body;

        if (!shop || !items || items.length === 0 || !pickupAddress || !deliveryAddress || !pickupSchedule || !totalAmount) {
            return res.status(400).json({ success: false, message: "All required fields must be provided" });
        }

        const newOrder = await Order.create({
            customer: req.user.id,
            shop,
            items,
            pickupAddress,
            deliveryAddress,
            pickupSchedule,
            totalAmount,
        });

        res.status(201).json({ success: true, data: newOrder });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get orders for the logged-in customer
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customer: req.user.id })
            .populate("shop", "firstName lastName email")
            .populate("items.service", "name price")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Shop action: Accept or Reject an order
export const respondToOrder = async (req, res) => {
    try {
        const { orderId, action, reason } = req.body;

        if (!orderId || !action || !["Accept", "Reject"].includes(action)) {
            return res.status(400).json({ success: false, message: "Invalid action or orderId" });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Capture the action in ShopOrderAction
        const shopAction = await ShopOrderAction.create({
            order: orderId,
            shop: req.user.id,
            action,
            reason,
        });

        // Update order status based on action
        if (action === "Reject") {
            order.orderStatus = "Cancelled";
        }
        // Note: If Accepted, we keep it as Pending or move to next stage "Pickup Done" 
        // depending on the desired flow. For now, we'll just log the action.

        await order.save();

        res.status(200).json({ success: true, message: `Order ${action}ed successfully`, data: shopAction });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
