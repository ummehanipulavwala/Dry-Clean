import express from 'express';
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import shopDetailsRoutes from "./routes/shopDetailsRoutes.js";
import advertisementRoutes from "./routes/advertisementRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import socketIO from "./socket.js";

dotenv.config();
connectDB();
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
socketIO(server);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/users", userRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/chat", chatRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/shop-details", shopDetailsRoutes);
app.use("/api/ads", advertisementRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.send("welcome to dry clean...");
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});