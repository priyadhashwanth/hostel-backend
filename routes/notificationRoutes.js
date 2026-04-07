const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  getNotifications,
  markAsRead
} = require("../controllers/notificationController");

// ✅ GET
router.get("/", protect, getNotifications);

// ✅ MARK AS READ
router.put("/:id", protect, markAsRead);

module.exports = router;