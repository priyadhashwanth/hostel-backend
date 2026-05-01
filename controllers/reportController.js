const Bill = require("../models/Bill");
const Room = require("../models/Room");


//  1. OCCUPANCY
exports.getOccupancy = async (req, res) => {
  try {
    const rooms = await Room.find();

    let totalCapacity = 0;
    let occupied = 0;

    rooms.forEach(room => {
      totalCapacity += room.capacity || 0;
      occupied += room.occupants?.length || 0;
    });

    const occupancyRate =
      totalCapacity > 0 ? (occupied / totalCapacity) * 100 : 0;

    res.json({ occupancyRate });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//  2. REVENUE

exports.getRevenue = async (req, res) => {
  try {
    const result = await Bill.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" }
        }
      }
    ]);

    const totalRevenue = result[0]?.total || 0;

    res.json({ totalRevenue });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//monthly revenue

exports.getMonthlyRevenue = async (req, res) => {
  try {
    const data = await Bill.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const monthNames = [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec"
    ];

    let fullYear = monthNames.map((month, index) => ({
      month,
      revenue: 0
    }));

    data.forEach(item => {
      const monthIndex = item._id - 1; // Mongo months start from 1
      if (fullYear[monthIndex]) {
        fullYear[monthIndex].revenue = item.revenue;
      }
    });

    res.json(fullYear);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//get full report

exports.getFullReport = async (req, res) => {
  try {
    // Revenue
    const revenueResult = await Bill.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" }
        }
      }
    ]);

    const revenue = revenueResult[0]?.total || 0;

    // Expenses (static for now)
    const totalExpenses = 20000;

    // Occupancy
    const rooms = await Room.find();

    let capacity = 0;
    let occupied = 0;

    rooms.forEach(r => {
      capacity += r.capacity || 0;
      occupied += r.occupants?.length || 0;
    });

    const occupancyRate =
      capacity > 0 ? (occupied / capacity) * 100 : 0;

    // Profit
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

//get expense

exports.getExpenses = async (req, res) => {
  try {
    const totalExpenses = 20000; // demo value
    res.json({ totalExpenses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
