const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Booking = require("../models/Booking");
const RoomListing = require("../models/RoomListing");

// admin verification middleware
function verifyAdmin(req, res, next) {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: "Unauthorized" });
    const token = auth.replace("Bearer ", "");
    const data = jwt.verify(token, process.env.JWT_SECRET);
    if (!data || data.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    req.user = { id: data.userId, role: data.role };
    next();
  } catch (err) {
    console.error("verifyAdmin error", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
}

// GET /api/admin/bookings - list all bookings
router.get("/", verifyAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find({}).sort({ createdAt: -1 }).populate('roomId');
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load bookings" });
  }
});

// PUT /api/admin/bookings/:id/:action - checkin|checkout|cancel
router.put("/:id/:action", verifyAdmin, async (req, res) => {
  try {
    const { id, action } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Not found" });

    const mapping = {
      checkin: "Checked-in",
      checkout: "Checked-out",
      cancel: "Cancelled",
    };

    if (!mapping[action]) return res.status(400).json({ message: "Unknown action" });

    booking.bookingStatus = mapping[action];
    await booking.save();

    // if checkout, increase room availability
    if (action === 'checkout') {
      const room = await RoomListing.findById(booking.roomId);
      if (room) {
        room.availableRooms = (room.availableRooms || 0) + 1;
        await room.save();
      }
    }

    res.json({ success: true, booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Action failed" });
  }
});

module.exports = router;

// // Customer booking save
// router.post("/save", async (req, res) => {
//   try {
//     const { bookingData, paymentIntentId, roomId, amount } = req.body;

//     if (!bookingData || !paymentIntentId || !roomId || !amount) {
//       return res.status(400).json({ error: "Missing data" });
//     }

//     const booking = new Booking({
//       ...bookingData,
//       paymentIntentId,
//       room: roomId,
//       amount,
//       status: "confirmed",
//     });

//     await booking.save();
//     res.json({ success: true, booking });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to save booking" });
//   }
// });

// module.exports = router;
