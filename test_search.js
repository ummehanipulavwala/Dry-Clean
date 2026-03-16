
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import { searchServices } from "./controllers/searchController.js";

dotenv.config();

async function testSearch() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/dryclean");
    console.log("Connected to DB");

    const mockUser = await User.findOne({ role: "Admin" });
    if (!mockUser) {
      console.log("No admin user found for testing");
      process.exit(1);
    }

    const req = {
      query: { q: "test" },
      user: { id: mockUser._id }
    };

    const res = {
      status: (code) => {
        console.log("Response Status:", code);
        return res;
      },
      json: (data) => {
        console.log("Response Data Keys:", Object.keys(data.data || {}));
        console.log("Results count:", data.data?.count);
        console.log("Users found:", data.data?.users?.length);
        console.log("Orders found:", data.data?.orders?.length);
        process.exit(0);
      }
    };

    console.log("Starting search for 'test'...");
    await searchServices(req, res);

  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

testSearch();
