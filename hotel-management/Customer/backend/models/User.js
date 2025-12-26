const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,        // 🔥 IMPORTANT
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    }
    , isActive: {
      type: Boolean,
      default: true       // ✅ Default active
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
