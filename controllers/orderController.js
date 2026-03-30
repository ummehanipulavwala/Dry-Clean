import mongoose from "mongoose";
import Order from "../models/Order.js";
import User from "../models/User.js";
import DeliveryPerson from "../models/DeliveryPerson.js";
import ShopOrderAction from "../models/ShopOrderAction.js";
import Payment from "../models/Payment.js";
import Service from "../models/servicemodel.js";
import ShopDetails from "../models/Shopdetails.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";
import { sendSMS } from "../utils/twilioService.js";

// Create a new order
export const createOrder = async (req, res) => {
    try {
        const { shop, items, pickupAddress, deliveryAddress, pickupSchedule, totalAmount, phone } = req.body;

        if (!shop || !items || items.length === 0 || !pickupAddress || !deliveryAddress || !pickupSchedule || !totalAmount) {
        const { shop, services, pickupAddress, deliveryAddress, pickupSchedule, phone } = req.body;

        if (!shop || !services || services.length === 0 || !pickupAddress || !deliveryAddress || !pickupSchedule) {
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

        // Fetch shop details to get shop-specific prices
        // Supporting both ShopDetails _id and owner userId
        let shopDoc = await ShopDetails.findById(shop).populate("services.serviceId");
        if (!shopDoc) {
            shopDoc = await ShopDetails.findOne({ userId: shop }).populate("services.serviceId");
        }

        if (!shopDoc) {
            return sendError(res, 404, "Shop details not found for the given ID or User ID");
        }

        // Server-side price calculation
        let totalAmount = 0;
        const priceBreakdown = [];

        for (const item of services) {
            // Find the service in the shop's defined services
            // Support matching by either global serviceId OR the shop-specific sub-document _id
            const shopService = shopDoc.services.find(
                (s) => s.serviceId && (
                    (s.serviceId._id ? s.serviceId._id.toString() : s.serviceId.toString()) === item.serviceId ||
                    s._id.toString() === item.serviceId
                )
            );

            if (!shopService) {
                return sendError(res, 400, `Service ${item.serviceId} is not offered by this shop or has been removed.`);
            }

            // Always use the actual Service ID for the order logic
            const actualServiceId = shopService.serviceId._id ? shopService.serviceId._id : shopService.serviceId;
            const serviceDoc = shopService.serviceId._id ? shopService.serviceId : (await Service.findById(actualServiceId));
            
            if (!serviceDoc) {
                return sendError(res, 400, `Service details not found for ${item.serviceId}`);
            }

            const price = shopService.price;

            if (price === undefined || price === null) {
                return sendError(res, 500, `Price not configured for service ${serviceDoc.name} in this shop.`);
            }

            const subtotal = price * item.quantity;
            totalAmount += subtotal;

            priceBreakdown.push({
                serviceId: serviceDoc._id,
                serviceName: serviceDoc.name,
                quantity: item.quantity,
                pricePerUnit: price,
                subtotal: subtotal
            });
        }

        const newOrder = await Order.create({
            customer: req.user.id,
            shop,
            items: priceBreakdown.map(item => ({
                service: item.serviceId,
                itemName: item.serviceName,
                quantity: item.quantity,
                price: item.pricePerUnit,
                finalPrice: item.subtotal
            })),
            pickupAddress,
            deliveryAddress,
            pickupSchedule,
            totalAmount,
<<<<<<< HEAD
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
=======
            priceBreakdown
        });

        // Create Payment document
        const newPayment = await Payment.create({
            orderId: newOrder._id,
            userId: req.user.id,
            shopId: shopDoc._id, // Use ShopDetails document ID
            totalAmount,
            finalAmount: totalAmount,
            breakdown: priceBreakdown,
            paymentStatus: "Pending"
        });

        // Link Payment to Order
        newOrder.paymentId = newPayment._id;
        await newOrder.save();

        sendSuccess(res, 201, "Order created successfully", { order: newOrder, payment: newPayment });
    } catch (error) {
        sendError(res, 500, error.message);
    }
};

// Calculate price preview (utility API)
export const calculatePrice = async (req, res) => {
    try {
        const { shopId, services } = req.body;

        if (!shopId || !services || !Array.isArray(services)) {
            return sendError(res, 400, "shopId and services array are required");
        }

        // Fetch shop details to get shop-specific prices
        // Supporting both ShopDetails _id and owner userId
        let shopDoc = await ShopDetails.findById(shopId).populate("services.serviceId");
        if (!shopDoc) {
            shopDoc = await ShopDetails.findOne({ userId: shopId }).populate("services.serviceId");
        }

        if (!shopDoc) {
            return sendError(res, 404, "Shop details not found for the given ID or User ID");
        }

        let totalAmount = 0;
        const breakdown = [];

        for (const item of services) {
            const shopService = shopDoc.services.find(
                (s) => s.serviceId && (
                    (s.serviceId._id ? s.serviceId._id.toString() : s.serviceId.toString()) === item.serviceId ||
                    s._id.toString() === item.serviceId
                )
            );

            if (!shopService) {
                return sendError(res, 400, `Service ${item.serviceId} is not offered by this shop or has been removed.`);
            }

            const actualServiceId = shopService.serviceId._id ? shopService.serviceId._id : shopService.serviceId;
            const serviceDoc = shopService.serviceId._id ? shopService.serviceId : (await Service.findById(actualServiceId));

            const price = shopService.price || 0;
            const subtotal = price * item.quantity;
            totalAmount += subtotal;

            breakdown.push({
                serviceId: actualServiceId,
                serviceName: serviceDoc ? serviceDoc.name : "Unknown Service",
                quantity: item.quantity,
                pricePerUnit: price,
                subtotal: subtotal
            });
        }

        sendSuccess(res, 200, "Price calculated successfully", {
            breakdown,
            totalAmount,
            currency: "INR"
        });
>>>>>>> c14c409 (order calculate payment)
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

<<<<<<< HEAD
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
=======
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
                sendSMS(customerPhone, body).catch(err => {
                    console.error("Delayed Customer SMS error:", err);
                });
            } else {
                console.warn(`Could not send SMS for order ${orderId}: Customer phone missing or user deleted.`);
            }
>>>>>>> c14c409 (order calculate payment)
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

<<<<<<< HEAD
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
=======
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
>>>>>>> c14c409 (order calculate payment)
    } catch (error) {
        sendError(res, 500, error.message);
    }
};

<<<<<<< HEAD
// Get all requests with user info, status, service tags, and total amount
=======
// Get all requests with user name, image, pickup date/time, address, total amount & status
>>>>>>> c14c409 (order calculate payment)
export const getAllRequests = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = { shop: req.user.id };

<<<<<<< HEAD
        // Support for "All", "Pending", "Active" filtering from UI tabs
        if (req.query.status && req.query.status.toLowerCase() !== "all") {
            filter.orderStatus = req.query.status.charAt(0).toUpperCase() + req.query.status.slice(1).toLowerCase();
=======
        // Optional status filter  e.g. ?status=Urgent  or  ?status=Pending,Active
        if (req.query.status) {
            const statuses = req.query.status.split(",").map(s => s.trim());
            filter.orderStatus = { $in: statuses };
>>>>>>> c14c409 (order calculate payment)
        }

        const totalOrders = await Order.countDocuments(filter);
        const orders = await Order.find(filter)
            .populate("customer", "firstName lastName profileImage")
            .populate("items.service", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

<<<<<<< HEAD
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
=======
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
>>>>>>> c14c409 (order calculate payment)

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

<<<<<<< HEAD
        // Notify Customer about the update
        dispatchNotification({
            req,
            recipientId: order.customer,
            type: "ORDER_UPDATED",
            message: `Your Order #${order._id.toString().slice(-6)} has been updated to: ${order.orderStatus}`,
            referenceId: order._id,
        });

=======
>>>>>>> c14c409 (order calculate payment)
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

<<<<<<< HEAD
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
=======
        // Prepare SMS body
        const customerName = `${order.customer?.firstName || ""} ${order.customer?.lastName || ""}`.trim() || "Customer";
        const itemsList = order.items.map(i => `${i.itemName} (x${i.quantity})`).join(", ");
        
        const smsBody = `New Delivery Assigned!
Order ID: #${order._id.toString().slice(-6)}
Customer: ${customerName}
Address: ${order.deliveryAddress}
Items: ${itemsList}
Total: ₹${order.totalAmount}
Please contact customer if needed.`;

        // Send SMS to delivery person (async)
        sendSMS(deliveryPerson.phone, smsBody).catch(err => {
            console.error("Delayed SMS error:", err);
>>>>>>> c14c409 (order calculate payment)
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
