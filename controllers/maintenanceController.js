const Maintenance = require("../models/Maintenance");
const User = require("../models/User");

// ✅ Create Request (Resident)
exports.createRequest = async (req, res) => {
  try {
    const { issue, priority } = req.body;

    const user = await User.findById(req.user._id);

    const request = await Maintenance.create({
      user: user._id,
      room: user.room,
      issue,
      priority
    });

    res.status(201).json({
      message: "Request created",
      request
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get My Requests (Resident)
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await Maintenance.find({
      user: req.user._id
    });

    res.json(requests);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//assign task

exports.assignTask = async (req, res) => {
  try {
    const { assignedTo } = req.body;

    const request = await Maintenance.findByIdAndUpdate(
      req.params.id,
      {
        assignedTo,
        status: "in-progress"
      },
      { new: true }
    );

    res.json({
      message: "Task assigned",
      request
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//update status

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const request = await Maintenance.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json({
      message: "Status updated",
      request
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};