import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "User" }
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

const createAdmin = async () => {
    try {
        console.log("Connecting to:", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const email = "admin@example.com";
        const password = "password123";
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userExists = await User.findOne({ email });
        if (userExists) {
            console.log("Admin user already exists");
        } else {
            await User.create({
                email,
                password: hashedPassword,
                role: "Admin"
            });
            console.log(`Admin user created: ${email} / ${password}`);
        }

        mongoose.connection.close();
    } catch (error) {
        console.error("Error creating admin:", error);
        process.exit(1);
    }
};

createAdmin();
