import Order from "../models/Order.js";
import User from "../models/User.js";
import DeliveryPerson from "../models/DeliveryPerson.js";
import ShopOrderAction from "../models/ShopOrderAction.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";
import { sendSMS } from "../utils/twilioService.js";
import { dispatchNotification } from "../utils/notificationDispatcher.js";

// Create a new order
export const createOrder = async (req, res) => {
    try {
        const { shop, items, pickupAddress, deliveryAddress, pickupSchedule, totalAmount, phone } = req.body;

        if (!shop || !items || items.length === 0 || !pickupAddress || !deliveryAddress || !pickupSchedule || !totalAmount) {
            return sendError(res, 400, "All required fields must be provided");
        }

        const user = await User.findById(req.user.id);
        if (!user) return sendError(res, 404, "User not found");

        if (!user.phone && !phone) {
            return sendError(res, 400, "Phone number is compulsory for creating an order");
        }

        if (phone) {
            user.phone = phone;
            await user.save();
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

        // Notify the Shop Owner about the new order
        dispatchNotification({
            req,
            recipientId: shop,
            type: "ORDER_PLACED",
            message: `New order request from ${user.firstName || "customer"}!`,
            referenceId: newOrder._id,
        });

        sendSuccess(res, 201, "Order created successfully", newOrder);
    } catch (error) {
        sendError(res, 500, error.message);
    }
};

// Get orders for the logged-in customer
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customer: req.user.id })
            .populate("customer", "firstName lastName profileImage")
            .populate("shop", "firstName lastName email")
            .populate("items.service", "name")
            .sort({ createdAt: -1 });

        sendSuccess(res, 200, "Orders fetched successfully", orders);
    } catch (error) {
        sendError(res, 500, error.message);
    }
};

// Shop action: Accept or Reject an order
export const respondToOrder = async (req, res) => {
    try {
        const { orderId, action, reason, deliveryPersonName, deliveryPersonPhone } = req.body;

        if (!orderId || !action || !["Accept", "Reject"].includes(action)) {
            return sendError(res, 400, "Invalid action or orderId");
        }

        const order = await Order.findById(orderId).populate("customer").populate("items.service");

        if (!order) {
            return sendError(res, 404, "Order not found");
        }

        if (action === "Accept") {
            if (!deliveryPersonName || !deliveryPersonPhone) {
                return sendError(res, 400, "Delivery person name and phone are required to accept an order");
            }
            order.deliveryPersonName = deliveryPersonName;
            order.deliveryPersonPhone = deliveryPersonPhone;
            order.orderStatus = "Active"; // Or appropriate status
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

        await order.save();

        // Notify Customer for both Accept and Reject
        const customerName = order.customer?.firstName || "Customer";
        const customerPhone = order.customer?.phone;
        const customerId = order.customer?._id;

        let smsBody = "";
        if (action === "Accept") {
            const itemDetails = order.items.map(i => `${i.itemName} x${i.quantity}`).join(", ");
            smsBody = `Hi ${customerName}, your order has been accepted!
Delivery Person: ${deliveryPersonName} (${deliveryPersonPhone})
Items: ${itemDetails}
Total Amount: ₹${order.totalAmount} (collect at delivery).`;
        } else {
            smsBody = `Hi ${customerName}, unfortunately your order has been rejected. Reason: ${reason || "Not specified"}. Please contact the shop for details.`;
        }

        if (customerId) {
            dispatchNotification({
                req,
                recipientId: customerId,
                type: action === "Accept" ? "ORDER_ACCEPTED" : "ORDER_REJECTED",
                message: smsBody.split("\n")[0], // Use first line for App notification message
                referenceId: order._id,
                sendSmsOpts: customerPhone ? { phone: customerPhone } : null,
            });
        } else {
            console.warn(`Could not notify customer for order ${orderId}: customerId missing.`);
        }

        sendSuccess(res, 200, `Order ${action}ed successfully`, { shopAction, order });
    } catch (error) {
        sendError(res, 500, error.message);
    }
};

// Get all orders with pagination (Filtered by Shop)
export const getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Filter by the logged-in shop owner's ID
        const filter = { shop: req.user.id };

        const totalOrders = await Order.countDocuments(filter);
        const orders = await Order.find(filter)
            .populate("customer", "firstName lastName profileImage")
            .populate("items.service", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalPages = Math.ceil(totalOrders / limit);

        sendSuccess(res, 200, "Orders fetched successfully", {
            orders,
            pagination: {
                totalOrders,
                totalPages,
                currentPage: page,
                limit
            },
        });
    } catch (error) {
        sendError(res, 500, error.message);
    }
};

// Get count of orders (All, Pending, Active) for the logged-in shop owner
export const getShopOrderStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const counts = await Order.aggregate([
            { $match: { shop: new mongoose.Types.ObjectId(userId) } },
            {
                $facet: {
                    pending: [{ $match: { orderStatus: "Pending" } }, { $count: "count" }],
                    active: [{ $match: { orderStatus: "Active" } }, { $count: "count" }],
                    all: [{ $count: "count" }]
                }
            }
        ]);

        const result = {
            pending: counts[0].pending[0]?.count || 0,
            active: counts[0].active[0]?.count || 0,
            all: counts[0].all[0]?.count || 0,
        };

        sendSuccess(res, 200, "Shop order stats fetched successfully", result);
    } catch (error) {
        sendError(res, 500, error.message);
    }
};

// Get all requests with user info, status, service tags, and total amount
export const getAllRequests = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = { shop: req.user.id };

        // Support for "All", "Pending", "Active" filtering from UI tabs
        if (req.query.status && req.query.status.toLowerCase() !== "all") {
            filter.orderStatus = req.query.status.charAt(0).toUpperCase() + req.query.status.slice(1).toLowerCase();
        }

        const totalOrders = await Order.countDocuments(filter);
        const orders = await Order.find(filter)
            .populate("customer", "firstName lastName profileImage")
            .populate("items.service", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const requests = orders.map(order => {
            // Get unique service names from order items
            const services = [...new Set(order.items.map(i => i.service?.name ?? i.itemName))];

            // Format pickup time logically (Today, Tomorrow, or Date)
            let pickupTimeStr = "Scheduled";
            if (order.pickupSchedule && order.pickupSchedule.date) {
                const date = new Date(order.pickupSchedule.date);
                const today = new Date();
                const tomorrow = new Date();
                tomorrow.setDate(today.getDate() + 1);

                let datePart = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
                if (date.toDateString() === today.toDateString()) datePart = "Today";
                else if (date.toDateString() === tomorrow.toDateString()) datePart = "Tomorrow";

                pickupTimeStr = `${datePart}, ${order.pickupSchedule.timeSlot ?? "TBD"}`;
            }

            return {
                orderId: order._id,
                userName: `${order.customer?.firstName ?? ""} ${order.customer?.lastName ?? ""}`.trim(),
                userImage: order.customer?.profileImage ?? null,
                pickupTime: pickupTimeStr,
                totalAmount: order.totalAmount,
                status: order.orderStatus,
                services: services, // Array of strings (e.g. ["Washing", "Ironing"])
                createdAt: order.createdAt,
            };
        });

        sendSuccess(res, 200, "Requests fetched successfully", {
            requests,
            pagination: {
                totalOrders,
                totalPages: Math.ceil(totalOrders / limit),
                currentPage: page,
                limit,
            },
        });
    } catch (error) {
        sendError(res, 500, error.message);
    }
};

// Update order (Admin)
export const updateOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!order) {
            return sendError(res, 404, "Order not found");
        }

        // Notify Customer about the update
        dispatchNotification({
            req,
            recipientId: order.customer,
            type: "ORDER_UPDATED",
            message: `Your Order #${order._id.toString().slice(-6)} has been updated to: ${order.orderStatus}`,
            referenceId: order._id,
        });

        sendSuccess(res, 200, "Order updated successfully", order);
    } catch (error) {
        sendError(res, 500, error.message);
    }
};

// Delete order (Admin)
export const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);

        if (!order) {
            return sendError(res, 404, "Order not found");
        }

        sendSuccess(res, 200, "Order deleted successfully");
    } catch (error) {
        sendError(res, 500, error.message);
    }
};

// Assign Delivery Person and Notify via SMS
export const assignDeliveryAndNotify = async (req, res) => {
    try {
        const { orderId, deliveryPersonId } = req.body;

        if (!orderId || !deliveryPersonId) {
            return sendError(res, 400, "Order ID and Delivery Person ID are required");
        }

        const order = await Order.findById(orderId).populate("customer");
        if (!order) {
            return sendError(res, 404, "Order not found");
        }

        const deliveryPerson = await DeliveryPerson.findById(deliveryPersonId);
        if (!deliveryPerson) {
            return sendError(res, 404, "Delivery person not found");
        }

        // Update order
        order.deliveryPersonName = deliveryPerson.name;
        order.deliveryPersonPhone = deliveryPerson.phone;
        await order.save();

        // 1. Notify the Delivery Person (SMS only for now as per legacy logic, but we add DB notification too)
        dispatchNotification({
            req,
            recipientId: deliveryPersonId,
            type: "DELIVERY_ASSIGNED",
            message: `New Delivery Assigned! Order ID: #${order._id.toString().slice(-6)}. Address: ${order.deliveryAddress}`,
            referenceId: order._id,
            sendSmsOpts: { phone: deliveryPerson.phone },
        });

        // 2. Notify the Customer that a delivery person is on the way
        dispatchNotification({
            req,
            recipientId: order.customer._id,
            type: "DELIVERY_ASSIGNED",
            message: `A delivery person (${deliveryPerson.name}) has been assigned to your order!`,
            referenceId: order._id,
        });

        sendSuccess(res, 200, "Delivery person assigned and notified successfully", {
            orderId: order._id,
            assignedTo: deliveryPerson.name
        });
    } catch (error) {
        console.error("Error in assignDeliveryAndNotify:", error);
        sendError(res, 500, error.message);
    }
};
