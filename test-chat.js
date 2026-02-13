import mongoose from "mongoose";
import dotenv from "dotenv";
import Message from "./models/Message.js";

dotenv.config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const now = new Date();
        const date = now.toLocaleDateString('en-GB');
        const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        const testMessage = await Message.create({
            chatId: new mongoose.Types.ObjectId(),
            sender: new mongoose.Types.ObjectId(),
            text: "Test message for date/time",
            date,
            time
        });

        console.log("Message created successfully:");
        console.log(testMessage);

        await Message.findByIdAndDelete(testMessage._id);
        console.log("Test message cleaned up.");

        mongoose.connection.close();
    } catch (error) {
        console.error("Test failed:", error);
        process.exit(1);
    }
};

test();
