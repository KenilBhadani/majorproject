const express = require("express");
const router = express.Router();
const sendEmail = require("../utils/sendEmail");
const Subscriber = require("../models/Subscriber"); // 👈 ADD THIS

router.post("/", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    // 1️⃣ Check if already subscribed
    const alreadySubscribed = await Subscriber.findOne({ email });
    if (alreadySubscribed) {
      return res.status(409).json({
        success: false,
        message: "Email already subscribed",
      });
    }

    // 2️⃣ Save email to database
    await Subscriber.create({ email });

    console.log("Subscribed email saved:", email);

    // 3️⃣ Send welcome email
    await sendEmail({
      to: email,
      subject: "Welcome to RoyalPark Privilege Club!",
      html: `
        <h2>Welcome to the Privilege Club 🎉</h2>
        <p>Thank you for subscribing! You now have access to special member benefits.</p>
        <p>Enjoy your stay at RoyalPark Hotel!</p>
      `,
    });

    return res.status(201).json({
      success: true,
      message: "Subscribed successfully. Welcome email sent!",
    });
  } catch (err) {
    console.error("Subscription Error:", err);

    // Duplicate email safety (MongoDB)
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already subscribed",
      });
    }

    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
