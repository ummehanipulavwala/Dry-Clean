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
import { dispatchNotification } from "../utils/notificationDispatcher.js";

// Create a new order with server-side price calculation and payment integration
export const createOrder = async (req, res) => {
    try {
        const { shop, services, pickupAddress, deliveryAddress, pickupSchedule, phone } = req.body;

        if (!shop || !services || !Array.isArray(services) || services.length === 0 || !pickupAddress || !deliveryAddress || !pickupSchedule) {
            return sendError(res, 400, "Required fields: shop, services (array), pickupAddress, deliveryAddress, pickupSchedule");
        }

        const user = await User.findById(req.user.id);
        if (!user) return sendError(res, 404, "User not found");

        if (!user.phone && !phone) {
            return sendError(res, 400, "Phone number is required for creating an order");
        }

        if (phone) {
            user.phone = phone;
            await user.save();
        }

        // Fetch shop details to get shop-specific prices
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
            // Support matching by either global serviceId OR the shop-specific sub-document _id
            const shopService = shopDoc.services.find((s) => {
                const sId = s.serviceId?._id ? s.serviceId._id.toString() : s.serviceId?.toString();
                return sId === item.serviceId || s._id.toString() === item.serviceId;
            });

            if (!shopService) {
                return sendError(res, 400, `Service ${item.serviceId} is not offered by this shop.`);
            }

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
                serviceId: actualServiceId,
                serviceName: serviceDoc.name,
                quantity: item.quantity,
                pricePerUnit: price,
                subtotal: subtotal
            });
        }

        const newOrder = await Order.create({
            customer: req.user.id,
            shop: shopDoc.userId, // Use the owner's userId for shop reference in Order
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
            priceBreakdown // Detailed breakdown stored in order
        });

        // Calculate platform commission and shop revenue
        const commissionPercent = shopDoc.commissionPercentage || 10;
        const platformCommissionAmount = (totalAmount * commissionPercent) / 100;
        const shopAmount = totalAmount - platformCommissionAmount;

        // Create Payment document
        const newPayment = await Payment.create({
            orderId: newOrder._id,
            userId: req.user.id,
            shopId: shopDoc._id, // Use ShopDetails document ID
            totalAmount,
            finalAmount: totalAmount,
            breakdown: priceBreakdown,
            paymentStatus: "Pending",
            platformCommissionPercent: commissionPercent,
            platformCommissionAmount,
            shopAmount,
            settlementStatus: "Pending"
        });

        // Link Payment to Order
        newOrder.paymentId = newPayment._id;
        await newOrder.save();

        // Notify the Shop Owner about the new order
        dispatchNotification({
            req,
            recipientId: shopDoc.userId,
            type: "ORDER_PLACED",
            message: `New order request from ${user.firstName || "customer"}!`,
            referenceId: newOrder._id,
        });

        sendSuccess(res, 201, "Order created successfully", { order: newOrder, payment: newPayment });
    } catch (error) {
        console.error("createOrder error:", error);
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

        let shopDoc = await ShopDetails.findById(shopId).populate("services.serviceId");
        if (!shopDoc) {
            shopDoc = await ShopDetails.findOne({ userId: shopId }).populate("services.serviceId");
        }

        if (!shopDoc) {
            return sendError(res, 404, "Shop details not found");
        }

        let totalAmount = 0;
        const breakdown = [];

        for (const item of services) {
            const shopService = shopDoc.services.find((s) => {
                const sId = s.serviceId?._id ? s.serviceId._id.toString() : s.serviceId?.toString();
                return sId === item.serviceId || s._id.toString() === item.serviceId;
            });

            if (!shopService) {
                return sendError(res, 400, `Service ${item.serviceId} is not offered by this shop.`);
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
            order.orderStatus = "Active";
        } else if (action === "Reject") {
            order.orderStatus = "Cancelled";
        }

        // Capture the action in ShopOrderAction
        const shopAction = await ShopOrderAction.create({
            order: orderId,
            shop: req.user.id,
            action,
            reason,
        });

        await order.save();

        // Notify Customer
        const customerName = order.customer?.firstName || "Customer";
        const customerPhone = order.customer?.phone;
        const customerId = order.customer?._id;

        let smsBody = "";
        if (action === "Accept") {
            const itemDetails = order.items.map(i => `${i.itemName} x${i.quantity}`).join(", ");
            smsBody = `Hi ${customerName}, your order has been accepted!\nDelivery Person: ${deliveryPersonName} (${deliveryPersonPhone})\nItems: ${itemDetails}\nTotal Amount: ₹${order.totalAmount} (collect at delivery).`;
        } else {
            smsBody = `Hi ${customerName}, unfortunately your order has been rejected. Reason: ${reason || "Not specified"}.`;
        }

        if (customerId) {
            dispatchNotification({
                req,
                recipientId: customerId,
                type: action === "Accept" ? "ORDER_ACCEPTED" : "ORDER_REJECTED",
                message: smsBody.split("\n")[0],
                referenceId: order._id,
                sendSmsOpts: customerPhone ? { phone: customerPhone } : null,
            });

            // Fallback: Send direct SMS if notification dispatcher settings are complex
            if (action === "Accept" && customerPhone) {
                sendSMS(customerPhone, smsBody).catch(err => console.error("Direct SMS error:", err));
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

        const filter = { shop: req.user.id };

        const totalOrders = await Order.countDocuments(filter);
        const orders = await Order.find(filter)
            .populate("customer", "firstName lastName profileImage")
            .populate("items.service", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        sendSuccess(res, 200, "Orders fetched successfully", {
            orders,
            pagination: {
                totalOrders,
                totalPages: Math.ceil(totalOrders / limit),
                currentPage: page,
                limit
            },
        });
    } catch (error) {
        sendError(res, 500, error.message);
    }
};

// Get count of orders for the logged-in shop owner
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

// Get count of orders grouped by status (Active, Pending) for the logged-in shop owner
export const getShopActiveOrders = async (req, res) => {
    try {
        const counts = await Order.aggregate([
            {
                $match: {
                    shop: new mongoose.Types.ObjectId(req.user.id),
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

        const result = { Active: 0, Pending: 0 };
        counts.forEach(({ _id, count }) => {
            result[_id] = count;
        });

        sendSuccess(res, 200, "Order counts fetched successfully", result);
    } catch (error) {
        sendError(res, 500, error.message);
    }
};

// Get all requests with filtering and pagination
export const getAllRequests = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = { shop: req.user.id };

        if (req.query.status) {
            const statuses = req.query.status.split(",").map(s => {
                const sTrim = s.trim();
                if (sTrim.toLowerCase() === "all") return null;
                return sTrim.charAt(0).toUpperCase() + sTrim.slice(1).toLowerCase();
            }).filter(s => s !== null);

            if (statuses.length > 0) {
                filter.orderStatus = { $in: statuses };
            }
        }

        const totalOrders = await Order.countDocuments(filter);
        const orders = await Order.find(filter)
            .populate("customer", "firstName lastName profileImage")
            .populate("items.service", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const requests = orders.map(order => {
            const services = [...new Set(order.items.map(i => i.service?.name ?? i.itemName))];

            let pickupTimeStr = "Scheduled";
            if (order.pickupSchedule && order.pickupSchedule.date) {
                const date = new Date(order.pickupSchedule.date);
                const today = new Date();
                const tomorrow = new Date();
                tomorrow.setDate(today.getDate() + 1);

                let datePart = date.toLocaleDateString('en-GB').replace(/\//g, '-');
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
                services: services,
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

        // Sync Payment Status if Order is Delivered or Completed
        if (req.body.orderStatus && ["Delivered", "Completed"].includes(req.body.orderStatus)) {
            await Payment.findOneAndUpdate(
                { orderId: order._id },
                {
                    $set: {
                        paymentStatus: "Collected",
                        paymentCollectedAt: new Date()
                    }
                }
            );
        }

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

        const order = await Order.findById(orderId).populate("customer").populate("items.service");
        if (!order) {
            return sendError(res, 404, "Order not found");
        }

        const shopDetails = await ShopDetails.findOne({ userId: order.shop });
        const shopName = shopDetails ? shopDetails.shopName : "Partner Shop";

        const deliveryPerson = await DeliveryPerson.findById(deliveryPersonId);
        if (!deliveryPerson) {
            return sendError(res, 404, "Delivery person not found");
        }

        order.deliveryPersonName = deliveryPerson.name;
        order.deliveryPersonPhone = deliveryPerson.phone;
        order.deliveryPerson = deliveryPersonId;
        order.isNotified = true;
        await order.save();

        const customerName = `${order.customer?.firstName || ""} ${order.customer?.lastName || ""}`.trim() || "Customer";
        const itemsList = order.items && order.items.length > 0
            ? order.items.map(i => `${i.itemName} x${i.quantity}`).join(", ")
            : "Laundry Items";

        const smsBody = `New Delivery!\nDear ${deliveryPerson.name},\nCustomer: ${customerName}\nShop: ${shopName}\nAddress: ${order.deliveryAddress}\nDetails: ${itemsList}\nTotal Amount To Collect: ₹${order.totalAmount}`;

        // Notify Delivery Person
        dispatchNotification({
            req,
            recipientId: deliveryPersonId,
            type: "DELIVERY_ASSIGNED",
            message: smsBody,
            referenceId: order._id,
            sendSmsOpts: { phone: deliveryPerson.phone },
        });

        // Notify Customer
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
