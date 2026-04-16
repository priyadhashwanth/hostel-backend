const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,

  email: {
    type: String,
    unique: true,
    required: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["resident", "admin", "staff"],
    default: "resident"
  },

  phone: String,
address: String,
emergencyContact: {
  name: String,
  phone: String,
  relation:String
},

  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room"
  },

  checkInDate:Date,
  checkOutDate:Date


}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);