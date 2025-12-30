const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Staff = require("../models/Staff");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const staff = await Staff.findOne({ email }).select("+password");
  if (!staff) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, staff.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { staffId: staff._id, role: staff.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({
    token,
    staff: {
      id: staff._id,
      name: staff.name,
      role: staff.role
    }
  });
});

module.exports = router;
