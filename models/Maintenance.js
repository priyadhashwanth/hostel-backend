const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room"
  },

  issue: {
    type: String,
    required: true
  },

  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  },

  status: {
    type: String,
    enum: ["pending", "in-progress", "completed"],
    default: "pending"
  },

  assignedTo: {
    type: String // staff name
  }

}, { timestamps: true });

module.exports = mongoose.model("Maintenance", maintenanceSchema);