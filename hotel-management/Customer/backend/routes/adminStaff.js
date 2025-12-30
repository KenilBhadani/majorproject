const express = require("express");
const bcrypt = require("bcryptjs");
const Staff = require("../models/Staff");

const router = express.Router();

/* ===============================
   CREATE STAFF (ADMIN ONLY)
================================ */
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, role, shift, password } = req.body;

    if (!name || !phone || !role || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await Staff.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Staff already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const staff = await Staff.create({
      name,
      email,
      phone,
      role,
      shift,
      password: hashedPassword,
      hasDashboardAccess: true
    });

    res.status(201).json(staff);
  } catch (err) {
    res.status(500).json({ message: "Failed to create staff" });
  }
});

module.exports = router;
