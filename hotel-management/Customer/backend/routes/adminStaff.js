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

    if (!name || !email || !phone || !role || !password) {
      return res.status(400).json({ message: "All required fields missing" });
    }

    const exists = await Staff.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "Staff already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const staffCount = await Staff.countDocuments();
    const staffId = `STF-${String(staffCount + 1).padStart(3, "0")}`;

    const staff = await Staff.create({
      staffId,
      name,
      email,
      phone,
      role,
      shift,
      password: hashedPassword
    });

    res.status(201).json(staff);
  } catch (err) {
    console.error("CREATE STAFF ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   GET ALL STAFF
================================ */
router.get("/", async (req, res) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   UPDATE STAFF
================================ */
router.put("/:id", async (req, res) => {
  try {
    const updated = await Staff.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch {
    res.status(500).json({ message: "Update failed" });
  }
});

/* ===============================
   DISABLE STAFF
================================ */
router.delete("/:id", async (req, res) => {
  try {
    await Staff.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
});

module.exports = router;
