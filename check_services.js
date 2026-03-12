import connectDB from "./config/db.js";
import Service from "./models/servicemodel.js";
import dotenv from "dotenv";

dotenv.config();

async function check() {
    await connectDB();
    const services = await Service.find();
    console.log(JSON.stringify(services, null, 2));
    process.exit(0);
}

check();
