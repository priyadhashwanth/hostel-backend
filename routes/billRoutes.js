const express = require("express");
const router = express.Router();
const billController = require("../controllers/billController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  createBill,
  getMyBills,
  payBill,
  createOrder,
  verifyPayment
} = require("../controllers/billController");

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

//pay installments

router.put("/installment/:id", protect, billController.payInstallment);

module.exports = router;

//razor pay

router.post("/:id/create-order", protect, createOrder);
router.post("/verify-payment", protect, verifyPayment);