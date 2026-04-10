const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Create Room (Admin only)
router.post("/", protect, authorizeRoles("admin"), roomController.createRoom);

// Get Rooms
router.get("/", protect, roomController.getRooms);

// Assign Room (Admin only)
router.post("/assign", protect, authorizeRoles("admin"), roomController.assignRoom);

module.exports = router;

//checkout

router.post(
  "/checkout",
  protect,
  authorizeRoles("admin"),
  roomController.checkoutRoom
);

//for delete
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  roomController.deleteRoom
);