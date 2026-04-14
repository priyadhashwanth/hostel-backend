const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room"
  },
  rent: Number,
  utilities: Number,
  extraCharges: Number,
  discount: { type: Number, default: 0 },
  lateFee: { type: Number, default: 0 },
  totalAmount: Number,
  status: {
    type: String,
    enum: ["pending", "paid"],
    default: "pending"
  },

  //payment history

   paymentHistory: [
    {
      amount: Number,
      date: {
        type: Date,
        default: Date.now
      },
      transactionId: String
    }
  ],

 // ✅ OPTIONAL (Installments)

 installments: [
  {
    amount: Number,
    paid: {
      type: Boolean,
      default: false
    },
    date: Date
  }
],
remainingAmount: Number

}, { timestamps: true });

module.exports = mongoose.model("Bill", billSchema);

