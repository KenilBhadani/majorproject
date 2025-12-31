require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/auth");
const app = express();

/* MIDDLEWARE */
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


/* MONGODB CONNECTION */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch(err => console.error("❌ MongoDB connection error:", err.message));

/* STATIC UPLOADS */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ROUTES */
const adminRooms = require("./routes/adminRooms");
app.use("/api/rooms", adminRooms);
app.use("/api/admin/rooms", adminRooms);
app.use("/api/auth", authRoutes);

/* HEALTH CHECK */
app.get("/", (req, res) => res.status(200).send("✅ Hotel Management API is running"));

/* START SERVER */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));

const staffDashboard = require("./routes/staffDashboard");
app.use("/api/staff", staffDashboard);

//Admin staff 
const adminStaffRoutes = require("./routes/adminStaff");
app.use("/api/admin/staff", adminStaffRoutes);

// register staff auth routes
const staffAuth = require("./routes/staffAuth");
app.use("/api/staff/auth", staffAuth);

// Booking routes
const roomRoutes = require("./routes/room");
app.use("/api/rooms", roomRoutes);