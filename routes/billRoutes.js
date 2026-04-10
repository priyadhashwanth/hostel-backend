const express = require("express");
const router = express.Router();
const billController = require("../controllers/billController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Admin
router.post("/", protect, authorizeRoles("admin"), billController.createBill);
router.get("/", protect, authorizeRoles("admin"), billController.getAllBills);

// Resident
router.get("/my", protect, billController.getMyBills);

// Payment
router.put("/pay/:id", protect, billController.payBill);

//delete
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  billController.deleteBill
);

module.exports = router;