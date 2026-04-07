const Notification = require("../models/Notification");

const sendNotification = async (userId, message, type) => {
  await Notification.create({
    user: userId,
    message,
    type
  });
};

module.exports = sendNotification;