const User = require("../models/User");
const Room = require("../models/Room");
const Maintenance = require("../models/Maintenance");
const Bill = require("../models/Bill");

//delete resident

exports.deleteResident = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Resident not found" });
    }

    if (user.role.toLowerCase() !== "resident") {
      return res.status(400).json({ message: "Only residents can be deleted" });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Resident deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADMIN DASHBOARD

exports.getAdminDashboard = async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments();

    const totalResidents = await User.countDocuments({
      role: "resident"
    });

    const maintenanceCount = await Maintenance.countDocuments({
      status: "pending"
    });

    const revenue = await Bill.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" }
        }
      }
    ]);

    
    res.json({
      totalRooms,
      totalResidents,
      maintenanceCount,
      revenue: revenue[0]?.total || 0
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// RESIDENT DASHBOARD

exports.getResidentDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate("room");

    const bills = await Bill.find({ user: userId });

    const maintenance = await Maintenance.find({ user: userId });

    res.json({
      user,
      bills,
      maintenance
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//maintainence req

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("room", "roomNumber");

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};