// const express = require("express");
// const router = express.Router();
// const Booking = require("../models/Booking");

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
