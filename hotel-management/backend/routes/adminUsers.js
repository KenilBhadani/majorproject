const express = require("express");
const router = express.Router();
const User = require("../models/User");

/* ================================
   GET ALL USERS (ADMIN)
================================ */
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password");

    // 🔁 MAP OLD SCHEMA → ADMIN UI FORMAT
    const formattedUsers = users.map(user => {
      const nameParts = (user.name || "").split(" ");

      return {
        _id: user._id,
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: user.email,
        mobileNo: user.phone || "",
        isActive: user.isActive !== false // default TRUE
      };
    });

    res.json(formattedUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load users" });
  }
});

/* ================================
   BLOCK / UNBLOCK USER
================================ */
router.put("/:id/status", async (req, res) => {
  try {
    const { isActive } = req.body;

    await User.findByIdAndUpdate(req.params.id, {
      isActive
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to update status" });
  }
});

module.exports = router;
