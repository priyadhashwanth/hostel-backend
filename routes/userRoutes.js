const express = require("express");
const router = express.Router();

const User = require("../models/User");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { deleteResident } = require("../controllers/authController");


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

//delete resident

router.delete("/users/:id", deleteResident);


module.exports = router;