import Order from "../models/Order.js";
import ShopOrderAction from "../models/ShopOrderAction.js";
<<<<<<< HEAD
import { sendSuccess, sendError } from "../utils/responseHandler.js";
=======
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e

// Create a new order
export const createOrder = async (req, res) => {
    try {
        const { shop, items, pickupAddress, deliveryAddress, pickupSchedule, totalAmount } = req.body;

        if (!shop || !items || items.length === 0 || !pickupAddress || !deliveryAddress || !pickupSchedule || !totalAmount) {
<<<<<<< HEAD
            return sendError(res, 400, "All required fields must be provided");
=======
            return res.status(400).json({ message: "All required fields must be provided" });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
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

<<<<<<< HEAD
        sendSuccess(res, 201, "Order created successfully", newOrder);
    } catch (error) {
        sendError(res, 500, error.message);
=======
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
    }
};

// Get orders for the logged-in customer
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customer: req.user.id })
            .populate("shop", "firstName lastName email")
            .populate("items.service", "name price")
            .sort({ createdAt: -1 });

<<<<<<< HEAD
        sendSuccess(res, 200, "Orders fetched successfully", orders);
    } catch (error) {
        sendError(res, 500, error.message);
=======
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
    }
};

// Shop action: Accept or Reject an order
export const respondToOrder = async (req, res) => {
    try {
        const { orderId, action, reason } = req.body;

        if (!orderId || !action || !["Accept", "Reject"].includes(action)) {
<<<<<<< HEAD
            return sendError(res, 400, "Invalid action or orderId");
=======
            return res.status(400).json({ message: "Invalid action or orderId" });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
        }

        const order = await Order.findById(orderId);

        if (!order) {
<<<<<<< HEAD
            return sendError(res, 404, "Order not found");
=======
            return res.status(404).json({ message: "Order not found" });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
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

<<<<<<< HEAD
        sendSuccess(res, 200, `Order ${action}ed successfully`, shopAction);
    } catch (error) {
        sendError(res, 500, error.message);
=======
        res.status(200).json({ message: `Order ${action}ed successfully`, shopAction });
    } catch (error) {
        res.status(500).json({ message: error.message });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
    }
};
