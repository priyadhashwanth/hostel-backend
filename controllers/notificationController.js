const Notification = require("../models/Notification");

//get notification

exports.getNotifications = async (req, res) => {
  try {
    let notifications;

    if (req.user.role==="admin"){
      notifications=await Notification.find()
      .sort({createdAt:-1});
    }else{
     notifications = await Notification.find({
      $or: [
        { user: req.user._id },  // user specific
        { user: null }           // global
      ]
    }).sort({ createdAt: -1 });
  }

    res.json(notifications);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ MARK AS READ
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.isRead = true;
    await notification.save();

    res.json({
      message: "Notification marked as read"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

