require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

/* =======================
   MIDDLEWARE
======================= */
app.use(cors());
app.use(express.json());

/* =======================
   MONGODB CONNECTION
======================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas connected"))
  .catch(err => console.error("MongoDB connection error:", err));

/* =======================
   STATIC UPLOADS
   (images saved in src/upload)
======================= */
app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "src", "upload"))
);

/* =======================
   ROUTES
======================= */

// Auth
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// Public room listing (if needed)
const roomRoutes = require("./routes/RoomListing");
app.use("/api/rooms", roomRoutes);

// Admin routes
const adminRooms = require("./routes/adminRooms");
const adminBookings = require("./routes/adminBookings");
const adminPayments = require("./routes/adminPayments");
const adminUsers = require("./routes/adminUsers");

app.use("/api/admin/rooms", adminRooms);
app.use("/api/admin", adminBookings);
app.use("/api/admin/payments", adminPayments);
app.use("/api/admin/users", adminUsers);

/* =======================
   HEALTH CHECK
======================= */
app.get("/", (req, res) => {
  res.send("Backend is running");
});

/* =======================
   START SERVER
======================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
