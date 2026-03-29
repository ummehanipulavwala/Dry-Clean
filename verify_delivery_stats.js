import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order.js';
import DeliveryPerson from './models/DeliveryPerson.js';
import User from './models/User.js';
import { assignDeliveryAndNotify, updateOrder } from './controllers/orderController.js';

dotenv.config();

const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.data = data;
        return res;
    };
    return res;
};

async function verify() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Prepare dummy data
        const customer = await User.findOne({ role: "User" }) || await User.create({ email: "cust@test.com", password: "123", role: "User" });
        const shop = await User.findOne({ role: "Shop" }) || await User.create({ email: "shop@test.com", password: "123", role: "Shop" });
        
        const dp = await DeliveryPerson.create({
            name: "Stat Tester",
            phone: "9999999999",
            status: "Active"
        }).catch(err => DeliveryPerson.findOne({ phone: "9999999999" }));

        // Reset stats for testing
        dp.assignedOrders = 0;
        dp.completedDeliveries = 0;
        await dp.save();

        const order = await Order.create({
            customer: customer._id,
            shop: shop._id,
            items: [{ service: new mongoose.Types.ObjectId(), itemName: "Suit", quantity: 1, price: 100, finalPrice: 100 }],
            pickupAddress: "Test",
            deliveryAddress: "Test",
            pickupSchedule: { date: new Date() },
            totalAmount: 100
        });

        // 1. Test Assignment
        console.log("\n--- Testing Assignment ---");
        const reqAssign = { body: { orderId: order._id, deliveryPersonId: dp._id } };
        const resAssign = mockRes();
        await assignDeliveryAndNotify(reqAssign, resAssign);
        
        const dpAfterAssign = await DeliveryPerson.findById(dp._id);
        console.log("Assigned Orders (expected 1):", dpAfterAssign.assignedOrders);

        // 2. Test Completion
        console.log("\n--- Testing Completion ---");
        const reqUpdate = { 
            params: { id: order._id }, 
            body: { orderStatus: "Completed" } 
        };
        const resUpdate = mockRes();
        await updateOrder(reqUpdate, resUpdate);

        const dpAfterComplete = await DeliveryPerson.findById(dp._id);
        console.log("Assigned Orders (expected 0):", dpAfterComplete.assignedOrders);
        console.log("Completed Deliveries (expected 1):", dpAfterComplete.completedDeliveries);

        await Order.findByIdAndDelete(order._id);
        await mongoose.connection.close();
        console.log("\nVerification complete.");
    } catch (error) {
        console.error("Verification failed:", error);
        process.exit(1);
    }
}

verify();
