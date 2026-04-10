const express = require("express");
const router = express.Router();

const maintenanceController = require("../controllers/maintenanceController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Resident
router.post("/", protect, authorizeRoles("resident"), maintenanceController.createRequest);
router.get("/my", protect, authorizeRoles("resident"), maintenanceController.getMyRequests);

// Admin / Staff → GET ALL REQUESTS ✅
router.get(
  "/",
  protect,
  authorizeRoles("admin", "staff"),
  maintenanceController.getAllRequests
);

// Admin / Staff

router.put(
  "/assign/:id",
  protect,
  authorizeRoles("admin", "staff"),
  maintenanceController.assignTask
);

//update status
router.put(
  "/status/:id",
  protect,
  authorizeRoles("admin", "staff"),
  maintenanceController.updateStatus
);


//for delete

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin", "staff"),
  maintenanceController.deleteRequest
);

module.exports = router;