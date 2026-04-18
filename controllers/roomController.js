const Room = require("../models/Room");
const User = require("../models/User");
const sendNotification = require("../utils/sendNotification");
const sendEmail=require("../utils/sendEmail");


// Create Room
exports.createRoom = async (req, res) => {
  try {
    const { roomNumber, capacity } = req.body;

    const room = await Room.create({
      roomNumber,
      capacity
    });
    
    //  Notification

    await sendNotification({
  message:` New room ${roomNumber} created `,
  type: "room"
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

    // prevent duplicate
    if (room.occupants.includes(userId)) {
      return res.status(400).json({ message: "User already assigned" });
    }

    room.occupants.push(userId);
    await room.save();

    user.room = roomId;
    await user.save();

    // IMPORTANT: populate before sending
    const updatedRoom = await Room.findById(roomId)
      .populate("occupants", "name email");

      //notification

      await sendNotification({
  userId: userId,
  message:` Room ${room.roomNumber} assigned to you `,
  type: "room"
});

//email notification

await sendEmail(
  user.email,
  "Room Assigned",
  `You have been assigned to room ${room.roomNumber}`
);

   
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

    //notification

    await sendNotification({
  userId: userId,
  message: "You checked out from room ",
  type: "room"
});

//email notification

await sendEmail(
  user.email,
  "Room Checkout",
  "You have successfully checked out"
);

    res.json({
      message: "User checked out successfully"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Delete Room (Admin)
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    //notification

    await sendNotification({
  message: `Room ${room.roomNumber} deleted`,
  type: "room"
});



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

//get my rooms

exports.getMyRoom = async (req, res) => {
  try {
    const userId = req.user._id;

    const room = await Room.findOne({
      occupants: userId
    }).populate("occupants", "name email");

    if (!room) {
      return res.status(404).json({ message: "No room assigned" });
    }

    res.json(room);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};