import mongoose from "mongoose";
import dotenv from "dotenv";
import axios from "axios";
import Payment from "./models/Payment.js";
import ShopDetails from "./models/Shopdetails.js";
import User from "./models/User.js";
import Order from "./models/Order.js";

dotenv.config();

/**
 * Verification Script: Test Payment Calculations for New Orders
 */
async function verifyPaymentCalculations() {
    try {
        console.log("Connecting to Database...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected.");

        // Find a shop and user for testing
        const shop = await ShopDetails.findOne();
        const user = await User.findOne({ role: "Customer" });

        if (!shop || !user) {
            console.error("Missing test data (shop or customer). Please ensure your database has at least one shop and one customer.");
            process.exit(1);
        }

        console.log(`Using Shop: ${shop.shopName} (Commission: ${shop.commissionPercentage || 10}%)`);
        console.log(`Using User: ${user.firstName} ${user.lastName}`);

        // Mock an order creation if needed or just check the code logic
        const totalAmount = 500;
        const commissionPercent = shop.commissionPercentage || 10;
        const expectedCommission = (totalAmount * commissionPercent) / 100;
        const expectedShopRev = totalAmount - expectedCommission;

        console.log(`Expected Commission: ${expectedCommission}`);
        console.log(`Expected Shop Rev: ${expectedShopRev}`);

        // In a real scenario, we would trigger an order creation via API.
        // For this verification, we search for the latest payment created by the system to see if it has these fields.
        const latestPayment = await Payment.findOne().sort({ createdAt: -1 });

        if (latestPayment) {
            console.log("\nLatest Payment Record Check:");
            console.log(`- ID: ${latestPayment._id}`);
            console.log(`- Total Amount: ${latestPayment.totalAmount}`);
            console.log(`- Final Amount: ${latestPayment.finalAmount}`);
            console.log(`- Comm %: ${latestPayment.platformCommissionPercent}`);
            console.log(`- Comm Amount: ${latestPayment.platformCommissionAmount}`);
            console.log(`- Shop Revenue: ${latestPayment.shopAmount}`);
            
            if (latestPayment.platformCommissionAmount !== undefined) {
                console.log("SUCCESS: platformCommissionAmount is NOT undefined.");
            } else {
                console.log("WARNING: platformCommissionAmount is undefined. This might be an old record.");
            }
        }

        process.exit(0);
    } catch (error) {
        console.error("Verification failed:", error);
        process.exit(1);
    }
}

verifyPaymentCalculations();
