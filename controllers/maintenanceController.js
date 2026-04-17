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

    // 🔔 Notify Admin (GLOBAL)
await sendNotification({
  userId:req.user.id,
  message: "New maintenance request has been submitted",
  
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

    // 🔔 Notify Staff
await sendNotification({
  userId: staffId,
  message: "You have been assigned a maintenance task 🧰"
  
});

// 🔔 Notify Resident
await sendNotification({
  userId: req.user.id,
  message: "Your request is now in progress"
  
});

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

   await Maintenance.findByIdAndUpdate(
  req.params.id,
  { status }
);

const request = await Maintenance.findById(req.params.id);

       // ✅ FETCH USER (IMPORTANT)
    const user = await User.findById(request.user);

    console.log("REQUEST USER:", request.user);

     
     // 🔔 Correct user
 await sendNotification(
      request.user,   // 👈 resident ID
      "Your maintenance request is completed",
      "maintenance"
    );

     // 📧 EMAIL NOTIFICATION (ADD THIS)
    await sendNotification({
      userId:req.user.id,  // ✅ THIS IS THE FIX
      message: `Your maintenance request is ${status}`,
      type: "maintenance"
    });

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

    //notification

    await sendNotification({
  userId: req.user.id,
  message: "Your maintenance request was deleted"
  
});

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

    //notification

    await sendNotification({
  userId: req.user.id,
  message: "Your maintenance request updated"
    });

   

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

    // ✅ allow admin OR owner
    const isOwner = request.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Access denied ❌" });
    }

    await request.deleteOne();

    //notification

    await sendNotification({
  userId: req.user.id,
  message: "Your maintenance request was deleted"
    });

res.json({ message: "Deleted successfully ✅" });

  } catch (error) {
    console.log("DELETE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};