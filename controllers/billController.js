const Bill = require("../models/Bill");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const sendNotification = require("../utils/sendNotification");
const razorpay = require("../utils/razorpay");
const crypto = require("crypto");



// create bill
exports.createBill = async (req, res) => {
  try {
    let {
      userId,
      rent,
      utilities,
      extraCharges,
      discount,
      lateFee
    } = req.body;

    // ✅ check user
    if (!userId) {
      return res.status(400).json({ message: "User required" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ convert to numbers
    rent = Number(rent) || 0;
    utilities = Number(utilities) || 0;
    extraCharges = Number(extraCharges) || 0;
    discount = Number(discount) || 0;
    lateFee = Number(lateFee) || 0;

    // ✅ calculate total
    const total =
      rent +
      utilities +
      extraCharges -
      discount +
      lateFee;

    const bill = await Bill.create({
      user: userId,
      rent,
      utilities,
      extraCharges,
      discount,
      lateFee,
      totalAmount: total,
      remainingAmount: total,
      status: "pending"
    });

    // ✅ send email
    await sendEmail(
      user.email,
      "New Bill Generated",
      `Your bill of ₹${total} is generated`
    );

    // ✅ send notification (FIXED)
    await sendNotification({
      userId: userId,
      message: `New bill generated: ₹${total} 💰`,
      type: "bill"
    });

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

    // ✅ GET USER
    const user = await User.findById(bill.user);

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

    // 🔔 NOTIFICATION
    await sendNotification({
      userId: bill.user,   // 👈 VERY IMPORTANT
      message: "Payment successful ✅",
      type: "bill"
    });

    //email notification

    await sendEmail(
  user.email,
  "Payment Successful",
  "Your payment has been completed successfully"
);

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
    // ✅ FIND BILL FIRST
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    // ✅ GET USER ID
    const userId = bill.user;

    // ✅ GET USER
    const user = await User.findById(userId);

    // ✅ DELETE BILL
    await Bill.findByIdAndDelete(req.params.id);

    // 🔔 NOTIFICATION
    await sendNotification({
      userId: userId,
      message: "Your bill has been deleted ❌",
      type: "bill"
    });

    // 📧 EMAIL
    if (user?.email) {
      await sendEmail(
        user.email,
        "Bill Removed",
        "Your bill has been deleted by admin"
      );
    }

    // ✅ SEND RESPONSE (IMPORTANT)
    return res.status(200).json({
      message: "Bill deleted successfully"
    });

  } catch (error) {
    console.log("DELETE ERROR:", error); // 🔥 debug
    return res.status(500).json({ message: error.message });
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

    // ✅ CONVERT TO NUMBER (VERY IMPORTANT)
    const payAmount = parseInt(req.body.amount);

    // ✅ VALIDATION
    if (!payAmount || payAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    if (payAmount > bill.remainingAmount) {
      return res.status(400).json({ message: "Too much amount" });
    }

    // ✅ REDUCE REMAINING (AFTER VALIDATION)
    bill.remainingAmount= Number(bill.remainingAmount- payAmount);

    //avoid negative
    if(bill.remainingAmount<0){
      bill.remainingAmount=0;
    }

    // ✅ add history
    bill.paymentHistory.push({
      amount: payAmount,
      date: new Date(),
      transactionId: "TXN" + Date.now()
    });

    // ✅ IF FULLY PAID
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

// razorpay



// 🔵 CREATE ORDER
exports.createOrder = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    const remaining = Number(bill.remainingAmount);

    if (!remaining || remaining <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const amount = remaining * 100; // paise

    const options = {
      amount,
      currency: "INR",
      receipt: "receipt_" + bill._id
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount,
      key: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//verify payment



exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      billId
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment ❌" });
    }

    // ✅ UPDATE BILL
    const bill = await Bill.findById(billId);

    bill.paymentHistory.push({
      amount: bill.remainingAmount,
      date: new Date(),
      transactionId: razorpay_payment_id
    });

    bill.remainingAmount = 0;
    bill.status = "paid";

    await bill.save();

    // 🔔 notification
    await sendNotification({
      userId: bill.user,
      message: "Payment successful via Razorpay ✅",
      type: "bill"
    });

    res.json({ message: "Payment verified ✅" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};