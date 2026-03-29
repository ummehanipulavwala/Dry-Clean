import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Feedback from './models/Feedback.js';
import User from './models/User.js';
import DeliveryPerson from './models/DeliveryPerson.js';
import { getAllFeedbacks } from './controllers/feedbackController.js';
import { updateDeliveryPerson } from './controllers/deliveryController.js';

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

        // 1. Test Feedback Pagination
        console.log("\n--- Testing Feedback Pagination ---");
        const reqFeedback = { query: { page: 1, limit: 2 } };
        const resFeedback = mockRes();
        
        await getAllFeedbacks(reqFeedback, resFeedback);
        console.log("Feedback Response Status:", resFeedback.statusCode);
        if (resFeedback.statusCode !== 200) {
            console.error("Feedback Response Error:", resFeedback.data?.message, resFeedback.data?.error);
        }
        
        const feedbackData = resFeedback.data?.data;
        console.log("Is Feedback Data an Array?", Array.isArray(feedbackData));
        if (Array.isArray(feedbackData)) {
            console.log("Number of feedbacks received:", feedbackData.length);
        } else {
            console.error("Feedback Data is NOT an array!");
        }

        // 2. Test Delivery Person Phone Validation (Update)
        console.log("\n--- Testing Delivery Person Update Validation ---");
        
        // Create a dummy delivery person first
        let dummy;
        try {
            dummy = await DeliveryPerson.findOne({ phone: "9123456780" });
            if (!dummy) {
                dummy = await DeliveryPerson.create({
                    name: "Test Person",
                    phone: "9123456780",
                    status: "Active"
                });
            }
        } catch (err) {
            console.error("Error creating dummy:", err.message);
            throw err;
        }

        const reqUpdate = { 
            params: { id: dummy._id }, 
            body: { phone: "" } // Empty phone
        };
        const resUpdate = mockRes();

        await updateDeliveryPerson(reqUpdate, resUpdate);
        console.log("Update Status Empty Phone (should be 400):", resUpdate.statusCode);
        console.log("Update Message:", resUpdate.data?.message);

        // Test invalid format
        reqUpdate.body.phone = "123";
        const resUpdate2 = mockRes();
        await updateDeliveryPerson(reqUpdate, resUpdate2);
        console.log("Update Status Invalid Format (should be 400):", resUpdate2.statusCode);
        console.log("Update Message:", resUpdate2.data?.message);

        await mongoose.connection.close();
        console.log("\nVerification complete.");
    } catch (error) {
        console.error("Verification failed:", error);
        process.exit(1);
    }
}

verify();
