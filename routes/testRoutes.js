const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Only logged-in users
router.get("/profile", protect, (req, res) => {
  res.json({
    message: "User Profile Data",
    user: req.user
  });
});

// Only admin
router.get("/admin", protect, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Welcome Admin" });
});

module.exports = router;