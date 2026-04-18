const Notification = require("../models/Notification");

const sendNotification = async ({ userId = null, message, type = "info" }) => {
  try {

    console.log(" Notification called:", message);
console.log(" Saving to DB...");
    await Notification.create({
      user: userId,   // null = global notification
      message,
      type,
      isRead: false
    });

    console.log(" Notification saved:", message);

  } catch (err) {
    console.error(" Notification error:", err.message);
  }
};

module.exports = sendNotification;