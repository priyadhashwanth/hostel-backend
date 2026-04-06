const Bill = require("../models/Bill");
const Room = require("../models/Room");


// ✅ 1. OCCUPANCY
exports.getOccupancy = async (req, res) => {
  try {
    const rooms = await Room.find();

    let totalCapacity = 0;
    let occupied = 0;

    rooms.forEach(room => {
      totalCapacity += room.capacity;
      occupied += room.occupants.length;
    });

    const occupancyRate = (occupied / totalCapacity) * 100;

    res.json({ occupancyRate });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ 2. REVENUE
exports.getRevenue = async (req, res) => {
  try {
    const bills = await Bill.find({ status: "paid" });

    const totalRevenue = bills.reduce(
      (acc, bill) => acc + bill.totalAmount,
      0
    );

    res.json({ totalRevenue });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ 3. EXPENSES (STATIC)
exports.getExpenses = async (req, res) => {
  try {
    const totalExpenses = 20000; // demo

    res.json({ totalExpenses });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ 4. FULL REPORT (MOST IMPORTANT)
exports.getFullReport = async (req, res) => {
  try {
    // 🔹 Revenue
    const bills = await Bill.find({ status: "paid" });
    const revenue = bills.reduce((acc, b) => acc + b.totalAmount, 0);

    // 🔹 Expenses
    const totalExpenses = 20000;

    // 🔹 Occupancy
    const rooms = await Room.find();
    let capacity = 0, occupied = 0;

    rooms.forEach(r => {
      capacity += r.capacity;
      occupied += r.occupants.length;
    });

    const occupancyRate = (occupied / capacity) * 100;

    // 🔹 Profit
    const profit = revenue - totalExpenses;

    res.json({
      revenue,
      totalExpenses,
      profit,
      occupancyRate
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};