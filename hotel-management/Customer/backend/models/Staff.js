const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
  {
    staffId: {
  type: String,
  unique: true
}
,
    name: {
      type: String,
      required: true,
      trim: true
    },

  email: {
  type: String,
  required: true,
  unique: true,
  lowercase: true,
  trim: true
   },

    phone: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: [
        "AdminStaff",
        "Receptionist",
        "Housekeeping",
        "Maintenance",
        "Manager"
      ],
      required: true
    },

    shift: {
      type: String,
      enum: ["Morning", "Evening", "Night"],
      default: "Morning"
    },

    password: {
      type: String,
      required: true,
      select: false
    },

    hasDashboardAccess: {
      type: Boolean,
      default: true
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Staff", staffSchema);
