const Bill = require("../models/Bill");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const sendNotification = require("../utils/sendNotification");

// create bill
exports.createBill = async (req, res) => {
  try {
    const {
      userId,
      rent,
      utilities,
      extraCharges,
      discount,
      lateFee
    } = req.body;

    const user = await User.findById(userId);

    // ✅ STEP 1: CALCULATE TOTAL
    const total =
      (rent || 0) +
      (utilities || 0) +
      (extraCharges || 0) -
      (discount || 0) +
      (lateFee || 0);


    const bill = await Bill.create({
      user: userId,
      room: user.room,
      rent,
      utilities,
      extraCharges,
      discount,
      lateFee,
      totalAmount:total,
      remainingAmount:total
    });


//email send

  await sendEmail(
  user.email,
  "New Bill Generated",
  `Your bill of ₹${total} is generated`
);

//notification

await sendNotification(
  user._id,
  `New bill of ₹${total} generated`,
  "bill"
);
    
    res.status(201).json({
      message: "Bill created",
      bill
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Get My Bills (Resident)

exports.getMyBills = async (req, res) => {
  try {
    const bills = await Bill.find({ user: req.user._id });

    res.json(bills);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Pay Bill

exports.payBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    // ✅ full payment amount
    const amount = bill.remainingAmount || bill.totalAmount;

    // ✅ add payment history
    bill.paymentHistory.push({
      amount,
      date:new Date(),
      transactionId: "TXN" + Date.now() // simple fake txn id
    });

    // ✅ update remaining
    bill.remainingAmount = 0;

    // ✅ update status
    bill.status = "paid";

    await bill.save();

    res.status(200).json({
      message: "Payment successful",
      bill
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Get All Bills (Admin)

exports.getAllBills = async (req, res) => {
  try {
    const bills = await Bill.find()
      .populate("user", "name email")
      .populate("room", "roomNumber");

    res.json(bills);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ❌ Delete Bill
exports.deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findByIdAndDelete(req.params.id);

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    res.json({ message: "Bill deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//pay installment

exports.payInstallment = async (req, res) => {
  try {
    const { amount } = req.body;

    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    // ❌ prevent overpayment
    if (amount > bill.remainingAmount) {
      return res.status(400).json({ message: "Too much amount" });
    }

    // ✅ reduce remaining
    bill.remainingAmount -= amount;

    // ✅ add installment
    bill.installments.push({
      amount,
      paid: true,
      date: new Date()
    });

    // ✅ if fully paid
    if (bill.remainingAmount === 0) {
      bill.status = "paid";
    }

    await bill.save();

    res.json({
      message: "Installment paid",
      bill
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};