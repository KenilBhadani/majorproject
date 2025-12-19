const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const adminRooms = require("./routes/adminRooms");
const adminBookings = require("./routes/adminBookings");
const adminPayments = require("./routes/adminPayments");
const adminUsers = require("./routes/adminUsers");

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas connected"))
  .catch(err => console.error(err));

// 🔹 ROOM APIs
app.use("/api/admin/rooms", adminRooms);

// 🔹 BOOKING + DASHBOARD APIs
app.use("/api/admin", adminBookings);

// 🔹 PAYMENT APIs
app.use("/api/admin/payments", adminPayments);


app.use("/api/admin/users", adminUsers);



// 🔹 Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);
