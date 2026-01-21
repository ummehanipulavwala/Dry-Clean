import express from 'express';
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import chatRoutes from "./routes/chatRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";

dotenv.config();
connectDB();
const app = express();

// Middleware
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);

// Service Routes
app.use("/api/services", serviceRoutes);

app.use("/api/users", userRoutes);

// Static folder for uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/", express.static(path.join(__dirname, "uploads")));

app.use("/api/chat", chatRoutes);

app.use("/api/search", searchRoutes);

app.get("/", (req, res) => {
  res.send("welcome to dry clean...");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
