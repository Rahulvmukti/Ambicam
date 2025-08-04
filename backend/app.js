const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const cors = require("cors");

dotenv.config({ path: "config/config.env" });

// Import Routes
const { redisClient } = require("./services/redisClient");
const authRoutes = require("./routes/authRoutes");
const cameraRoutes = require("./routes/cameraRoutes");
const streamRoutes = require("./routes/streamRoutes");
const aiRoutes = require("./routes/aiRoutes");
const settingRoutes = require("./routes/settingRoutes");
const alertRoutes = require("./routes/alertRoutes");
const adminRoutes = require("./routes/adminRoutes");
const analyticsimageRoutes = require("./routes/analyticsimageRoutes");

const app = express();


// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
 origin: [
      "https://localhost",
      "http://localhost:3003",
      "https://20.244.98.154:3003",
      "https://ambicam.vmukti.com:3003",
     "https://ambicam.vmukti.com",
      '*',
    ],
credentials: true,
  })
);

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/camera", cameraRoutes);
app.use("/api/stream", streamRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/setting", settingRoutes);
app.use("/api/alert", alertRoutes);
app.use("/api/admin", adminRoutes);
app.use("/analyticsimage", analyticsimageRoutes);

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

module.exports = app;
