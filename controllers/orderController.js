import Order from "../models/Order.js";
import User from "../models/User.js";
import ShopOrderAction from "../models/ShopOrderAction.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";
import { sendSMS } from "../utils/twilioService.js";

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

        // Send SMS if accepted
        if (action === "Accept") {
            const customerName = order.customer?.firstName || "Customer";
            const customerPhone = order.customer?.phone;

            const itemDetails = order.items.map(i => `${i.itemName} x${i.quantity}`).join(", ");
            const body = `Hi ${customerName}, your order has been accepted!
Delivery Person: ${deliveryPersonName} (${deliveryPersonPhone})
Items: ${itemDetails}
Total Amount: ₹${order.totalAmount} (collect at delivery).`;

            if (customerPhone) {
                await sendSMS(customerPhone, body);
            } else {
                console.warn(`Could not send SMS for order ${orderId}: Customer phone missing or user deleted.`);
            }
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

// Get count of orders grouped by status (Active, Pending) for the logged-in shop owner
export const getShopActiveOrders = async (req, res) => {
    try {
        const counts = await Order.aggregate([
            {
                $match: {
                    shop: req.user._id,
                    orderStatus: { $in: ["Pending", "Active"] },
                },
            },
            {
                $group: {
                    _id: "$orderStatus",
                    count: { $sum: 1 },
                },
            },
        ]);

        // Shape into a clean object: { Active: 15, Pending: 3 }
        const result = {};
        counts.forEach(({ _id, count }) => {
            result[_id] = count;
        });

        sendSuccess(res, 200, "Order counts fetched successfully", result);
    } catch (error) {
        sendError(res, 500, error.message);
    }
};

// Get all requests with user name, image, pickup date/time, address, total amount & status
export const getAllRequests = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = { shop: req.user.id };

        // Optional status filter  e.g. ?status=Urgent  or  ?status=Pending,Active
        if (req.query.status) {
            const statuses = req.query.status.split(",").map(s => s.trim());
            filter.orderStatus = { $in: statuses };
        }

        const totalOrders = await Order.countDocuments(filter);
        const orders = await Order.find(filter)
            .populate("customer", "firstName lastName profileImage")
            .populate("items.service", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const requests = orders.map(order => ({
            orderId: order._id,
            userName: `${order.customer?.firstName ?? ""} ${order.customer?.lastName ?? ""}`.trim(),
            userImage: order.customer?.profileImage ?? null,
            pickupDate: order.pickupSchedule?.date ?? null,
            pickupTime: order.pickupSchedule?.timeSlot ?? null,
            pickupAddress: order.pickupAddress,
            totalAmount: order.totalAmount,
            status: order.orderStatus,
            items: order.items.map(i => ({
                service: i.service?.name ?? i.itemName,
                quantity: i.quantity,
                price: i.price,
                finalPrice: i.finalPrice,
            })),
            createdAt: order.createdAt,
        }));

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
