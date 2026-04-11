const Maintenance = require("../models/Maintenance");
const User = require("../models/User");
const sendNotification = require("../utils/sendNotification");
const sendEmail = require("../utils/sendEmail");


// ✅ Create Request (Resident)
exports.createRequest = async (req, res) => {
  try {
    const { title, issue, priority } = req.body;

    if (!title || !issue) {
      return res.status(400).json({ message: "All fields required" });
    }

    const request = await Maintenance.create({
      user: req.user._id,
      title,
      issue,
      priority
    });

    res.status(201).json(request);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get My Requests (Resident)
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await Maintenance.find({
      user: req.user._id
    })
    .populate("assignedTo","name");

    res.json(requests);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//assign task

exports.assignTask = async (req, res) => {
  try {
    console.log("BODY:", req.body); // 🔍 debug

    const { staffId } = req.body;   // ✅ MUST BE staffId

    if (!staffId) {
      return res.status(400).json({ message: "Staff ID required" });
    }

    const request = await Maintenance.findByIdAndUpdate(
      req.params.id,
      {
        assignedTo: staffId,       // ✅ use same name
        status: "in-progress"
      },
      { new: true }
    ).populate("assignedTo", "name");

    res.json({
      message: "Task assigned successfully ✅",
      request
    });

  } catch (error) {
    console.log(error); // 🔍 see error
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

       // ✅ FETCH USER (IMPORTANT)
    const user = await User.findById(request.user);

     // ✅ SEND NOTIFICATION HERE
    await sendNotification(
      request.user,   // 👈 resident ID
      "Your maintenance request is completed",
      "maintenance"
    );

     // 📧 EMAIL NOTIFICATION (ADD THIS)
    await sendEmail(
      user.email,
      "Maintenance Update",
      "Your maintenance request has been completed"
    );

    res.json({
      message: "Status updated",
      request
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ❌ Delete Request
exports.deleteRequest = async (req, res) => {
  try {
    const request = await Maintenance.findByIdAndDelete(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json({ message: "Request deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get all request

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await Maintenance.find()
      .populate("user", "name")
      .populate("assignedTo", "name");

    res.json(requests);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//update request

exports.updateRequest = async (req, res) => {
  try {
    const { title, issue, priority } = req.body;

    const request = await Maintenance.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // ✅ Only owner can edit
    if (request.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // ✅ Optional: allow edit only if pending
    if (request.status !== "pending") {
      return res.status(400).json({ message: "Cannot edit after processing" });
    }

    request.title = title || request.title;
    request.issue = issue || request.issue;
    request.priority = priority || request.priority;

    await request.save();

    res.json({ message: "Request updated", request });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//delete request

exports.deleteRequest = async (req, res) => {
  try {
    const request = await Maintenance.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // 🔥 FIX (IMPORTANT)
    if (request.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    await request.deleteOne();

    res.json({ message: "Deleted successfully ✅" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};