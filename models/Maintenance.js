const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  //room number will show in maintainence req
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room"
  },

  title: {
    type: String,
    required: true
  },
  issue: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "low"
  },
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed"],
    default: "pending"
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

module.exports = mongoose.model("Maintenance", maintenanceSchema);