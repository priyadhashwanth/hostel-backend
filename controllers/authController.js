const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendNotification = require("../utils/sendNotification");
const sendEmail=require("../utils/sendEmail");

// Generate Token
const generateToken = (id) => {
  return jwt.sign(
    {
      id
     },
      process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
};

// ✅ REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password, role,phone,address,emergencyContact } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("REQ BODY",req.body);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      address,
      emergencyContact
    });

    // 🔔 send notification
await sendNotification({
  userId:user._id,
  message:"Welcome! Your account has been created 🎉",
  type:"info"
  
  });

  //email notification

  await sendEmail(
  user.email,
  "Welcome 🎉",
  `Hello ${user.name}, your account has been created successfully!`
);

    res.status(201).json({
      message: "User Registered ✅",
      token: generateToken(user._id)
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ LOGIN

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // ✅ Check user exists FIRST
    if (!user) {
      return res.status(404).json({ message: "User not found ❌" });
    }

    // ✅ Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Email or Password ❌" });
    }

    // 🔔 send notification (safe)
    await sendNotification({
       userId: user._id,
  message: "You logged in successfully ✅"
  
});

//email notification

await sendEmail(
  user.email,
  "Login Alert 🔐",
  `Hi ${user.name}, you logged in successfully.`
);

    // ✅ SUCCESS RESPONSE
    res.json({
      message: "Login Successful ✅",
      token: generateToken(user._id),
      user: {
        _id: user._id.toString(),
        name: user.name || "",
        email: user.email || "",
        role: user.role || "resident" // 🔥 FIX HERE
      }
    });

  } catch (error) {
    console.log("LOGIN ERROR:", error); // 👈 IMPORTANT
    res.status(500).json({ message: error.message });
  }
};

//logout

// 🔴 LOGOUT
exports.logout = async (req, res) => {
  try {

    //send notification 

    await sendNotification({
      userId: req.user._id,
      message: "You logged out successfully 👋",
      type:"info"
    });

    //email notification

    await sendEmail(
  req.user.email,
  "Logout Alert 👋",
  `Hi ${req.user.name}, you logged out successfully.`
);

    res.json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};