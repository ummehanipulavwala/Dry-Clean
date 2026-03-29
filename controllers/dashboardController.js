import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import Service from "../models/servicemodel.js";
import ShopDetails from "../models/Shopdetails.js";
import Feedback from "../models/Feedback.js";
import DeliveryPerson from "../models/DeliveryPerson.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";

export const getDashboardStats = async (req, res) => {
    try {
        const [totalOrders, totalPayments, totalServices, totalShops, totalFeedback, totalDeliveryPersons] = await Promise.all([
            Order.countDocuments(),
            Payment.countDocuments(),
            Service.countDocuments(),
            ShopDetails.countDocuments(),
            Feedback.countDocuments(),
            DeliveryPerson.countDocuments()
        ]);

        // Aggregate total revenue from payments using finalAmount
        const revenueAggregate = await Payment.aggregate([
            { $group: { _id: null, total: { $sum: "$finalAmount" } } }
        ]);
        const totalRevenue = revenueAggregate.length > 0 ? revenueAggregate[0].total : 0;

        // Fetch Recent Orders (latest 5)
        const recentOrdersRaw = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("customer", "firstName lastName name");

        const recentOrders = recentOrdersRaw.map(o => ({
            id: o._id.toString().slice(-4),
            customer: o.customer ? (o.customer.name || `${o.customer.firstName} ${o.customer.lastName}`) : "Walk-in",
            service: o.items && o.items.length > 0 ? o.items[0].itemName : "General Cleaning",
            status: o.orderStatus || "Pending",
            amount: `₹${o.totalAmount || 0}`,
            date: o.createdAt
        }));

        // Calculate Popular Services (aggregating from items array)
        const popularServicesRaw = await Order.aggregate([
            { $unwind: "$items" },
            { $group: { _id: "$items.itemName", count: { $sum: "$items.quantity" } } },
            { $sort: { count: -1 } },
            { $limit: 4 }
        ]);

        const maxCount = popularServicesRaw.length > 0 ? popularServicesRaw[0].count : 1;
        const popularServices = popularServicesRaw.map(ps => ({
            name: ps._id || "Other",
            count: ps.count,
            percent: Math.round((ps.count / maxCount) * 100)
        }));

        sendSuccess(res, 200, "Dashboard stats fetched successfully", {
            overview: {
                orders: totalOrders,
                payments: totalPayments,
                services: totalServices,
                shops: totalShops,
                feedback: totalFeedback,
                revenue: totalRevenue,
                deliveryPersons: totalDeliveryPersons
            },
            recentOrders,
            popularServices: popularServices.length > 0 ? popularServices : [
                { name: 'Dry Cleaning', count: 0, percent: 0 },
                { name: 'Laundry', count: 0, percent: 0 }
            ]
        });
    } catch (error) {
        sendError(res, 500, error.message);
    }
};
