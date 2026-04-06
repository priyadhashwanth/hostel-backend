const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// 📊 Occupancy
router.get("/occupancy", protect, authorizeRoles("admin"), reportController.getOccupancy);

// 💰 Revenue
router.get("/revenue", protect, authorizeRoles("admin"), reportController.getRevenue);

// 💸 Expenses
router.get("/expenses", protect, authorizeRoles("admin"), reportController.getExpenses);

// 📈 Full Report
router.get("/", protect, authorizeRoles("admin"), reportController.getFullReport);

module.exports = router;