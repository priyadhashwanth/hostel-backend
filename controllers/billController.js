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

    const totalAmount =
      rent + utilities + extraCharges - (discount || 0) + (lateFee || 0);


    const bill = await Bill.create({
      user: userId,
      room: user.room,
      rent,
      utilities,
      extraCharges,
      discount,
      lateFee,
      totalAmount
    });


//email send

  await sendEmail(
  user.email,
  "New Bill Generated",
  `Your bill of ₹${totalAmount} is generated`
);

//notification

await sendNotification(
  user._id,
  `New bill of ₹${totalAmount} generated`,
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
    const bill = await Bill.findByIdAndUpdate(
      req.params.id,
      { status: "paid" },
      { new: true }
    );

    // ✅ SEND NOTIFICATION HERE
    await sendNotification(
      bill.user._id,   // 👈 resident ID
      "Payment successful",
      "payment"
    );

    res.json({
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


//export email

exports.payBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id).populate("user");

    bill.status = "paid";
    await bill.save();

    // 📧 Send confirmation
    await sendEmail(
      bill.user.email,
      "Payment Successful",
      "Your payment is completed"
    );

    res.json({
      message: "Payment successful",
      bill
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};