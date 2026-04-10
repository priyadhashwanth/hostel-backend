const Room = require("../models/Room");
const User = require("../models/User");

// Create Room
exports.createRoom = async (req, res) => {
  try {
    const { roomNumber, capacity } = req.body;

    const room = await Room.create({
      roomNumber,
      capacity
    });

    res.status(201).json({
      message: "Room created",
      room
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get all rooms

exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate("occupants", "name email");

    res.json(rooms);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//assign room 

exports.assignRoom = async (req, res) => {
  try {
    const { userId, roomId } = req.body;

    const room = await Room.findById(roomId);
    const user = await User.findById(userId);

    if (!room || !user) {
      return res.status(404).json({ message: "Room or User not found" });
    }

    if (room.occupants.length >= room.capacity) {
      return res.status(400).json({ message: "Room is full" });
    }

    room.occupants.push(userId);
    await room.save();

    user.room = roomId;
    await user.save();

    res.json({
      message: "Room assigned",
      room
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//checkout

exports.checkoutRoom = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user || !user.room) {
      return res.status(404).json({ message: "User or room not found" });
    }

    const room = await Room.findById(user.room);

    // Remove user from room occupants
    room.occupants = room.occupants.filter(
      (id) => id.toString() !== userId
    );

    await room.save();

    // Remove room from user
    user.room = null;
    await user.save();

    res.json({
      message: "User checked out successfully"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ❌ Delete Room (Admin)
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json({ message: "Room deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//update room 
exports.updateRoom = async (req, res) => {
  try {
    const { capacity } = req.body;

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { capacity },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json(room);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};