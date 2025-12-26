const express = require("express");
const router = express.Router();

// TEMP: remove auth for testing, we’ll add later
router.get("/overview", async (req, res) => {
  res.json({
    totalBookings: 0,
    roomsAvailable: 0,
    sparklineBookings: []
  });
});

router.get("/recent-bookings", async (req, res) => {
  res.json({
    bookings: []
  });
});

module.exports = router;
