const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Create Room (Admin only)
router.post("/", protect, authorizeRoles("admin"), roomController.createRoom);

// Assign Room (Admin only)
router.post("/assign", protect, authorizeRoles("admin"), roomController.assignRoom);

//get rooms(all roles)

router.get("/", protect, authorizeRoles("admin", "staff", "resident"), roomController.getRooms);

//get my rooms

router.get(
  "/my-room",
  protect,
  authorizeRoles("resident"),
  roomController.getMyRoom
);

module.exports = router;


//checkout( admin)

router.post(
  "/checkout",
  protect,
  authorizeRoles("admin"),
  roomController.checkoutRoom
);

//for delete(admin)
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  roomController.deleteRoom
);

//update rooms(admin)
router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  roomController.updateRoom
);

