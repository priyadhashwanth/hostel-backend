const express = require("express");
const router = express.Router();

const User = require("../models/User");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  deleteResident,
  getAdminDashboard,
  getResidentDashboard,getMe
} = require("../controllers/userController");

//maintainence req
router.get("/me", protect, getMe);

//  Admin Dashboard
router.get(
  "/admin-dashboard",
  protect,
  roleMiddleware(["admin"]),
  getAdminDashboard
);

//  Resident Dashboard
router.get(
  "/resident-dashboard",
  protect,
  roleMiddleware(["resident"]),
  getResidentDashboard
);

// ✅ THEN dynamic route
router.get(
  "/:id",
  protect,
  async (req, res) => {
    // your code
  }
);


//users
//  GET ALL USERS (Admin / Staff)
router.get(
  "/",protect,authorizeRoles("admin","staff"),
    async (req, res) => {
    try {
      const users = await User.find()
        .select("-password")
        .populate("room", "roomNumber");

      res.json(users);

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);


//  UPDATE USER (Admin only)
router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { name, phone, address, emergencyContact } = req.body;

      const user = await User.findByIdAndUpdate(
        req.params.id,
        {
          name,
          phone,
          address,
          emergencyContact
        },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        message: "User updated successfully",
        user
      });

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

//delete resident

router.delete("/users/:id", deleteResident);



//  GET SINGLE USER (optional)
router.get(
  "/:id",
  protect,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id)
        .select("-password")
        .populate("room", "roomNumber");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);






module.exports = router;