const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendNotification = require("../utils/sendNotification");

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
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    // 🔔 send notification
await sendNotification(
  user._id,
  "Welcome! Your account has been created 🎉",
  "register"
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
    await sendNotification(
      user._id,
      "You logged in successfully ✅",
      "login"
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

exports.logout = (req, res) => {
  res.json({
    message: "Logged out successfully"
  });
};