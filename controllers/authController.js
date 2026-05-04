const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendNotification = require("../utils/sendNotification");
const sendEmail=require("../utils/sendEmail");
const crypto=require("crypto");

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

//  REGISTER

exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      address,
      emergencyContact
    } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    // ✅ Required fields
    if (!name?.trim() || !email?.trim() || !password?.trim() || !role) {
      return res.status(400).json({
        message: "Name, Email, Password and Role are required"
      });
    }

    // ✅ Role validation (IMPORTANT)
    const validRoles = ["resident", "staff"];

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role selected"
      });
    }

    // 🔒 Block admin creation
    if (role === "admin") {
      return res.status(403).json({
        message: "Admin cannot be created from register"
      });
    }

    // ✅ Name validation
    if (name.trim().length < 3) {
      return res.status(400).json({
        message: "Name must be at least 3 characters"
      });
    }

    // ✅ Email validation
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        message: "Invalid email format"
      });
    }

    // ✅ Password validation
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    // ✅ Phone validation
    if (phone && !phoneRegex.test(phone)) {
      return res.status(400).json({
        message: "Phone must be 10 digits"
      });
    }

    // ✅ Address validation
    if (!address || !address.trim()) {
  return res.status(400).json({
    message: "Address is required"
  });
}

if (address.trim().length < 5) {
  return res.status(400).json({
    message: "Address must be at least 5 characters"
  });
}

    // ✅ Emergency validation ONLY for resident
    if (role === "resident") {
      if (!emergencyContact) {
        return res.status(400).json({
          message: "Emergency contact required for residents"
        });
      }

      const { name: eName, phone: ePhone, relation } = emergencyContact;

      if (!eName?.trim()) {
        return res.status(400).json({
          message: "Emergency name required"
        });
      }

      if (!phoneRegex.test(ePhone)) {
        return res.status(400).json({
          message: "Emergency phone must be 10 digits"
        });
      }

      if (!relation?.trim()) {
        return res.status(400).json({
          message: "Emergency relation required"
        });
      }
    }

    
 // Existing user
    const userExists = await User.findOne({
      email: email.trim()
    });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      address,
      emergencyContact
    });

    //  send notification
await sendNotification({
  userId:user._id,
  message:"Welcome! Your account has been created 🎉",
  type:"info"
  
  });

  //email notification

  await sendEmail(
  user.email,
  "Welcome ",
  `Hello ${user.name}, your account has been created successfully!`
);

    res.status(201).json({
      message: "User Registered ",
      token: generateToken(user._id)
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  LOGIN

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Empty validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and Password are required"
      });
    }

    // Trim spaces
    const cleanEmail = email.trim();

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        message: "Invalid email format"
      });
    }

    // Password length
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    const user = await User.findOne({ email:cleanEmail });

    //  Check user exists FIRST
    if (!user) {
      return res.status(404).json({ message: "User not found ❌" });
    }

    //  Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Email or Password ❌" });
    }

    //  send notification (safe)
    await sendNotification({
       userId: user._id,
  message: "You logged in successfully "
  
});

//email notification

await sendEmail(
  user.email,
  "Login Alert ",
  `Hi ${user.name}, you logged in successfully.`
);

    //  SUCCESS RESPONSE
    res.json({
      message: "Login Successful ",
      token: generateToken(user._id),
      user: {
        _id: user._id.toString(),
        name: user.name || "",
        email: user.email || "",
        role: user.role || "resident" //  resident
      }
    });

  } catch (error) {
    //console.log("LOGIN ERROR:", error); //error msg
    res.status(500).json({ message: error.message });
  }
};

// GET LOGGED-IN USER PROFILE
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("room", "roomNumber"); // 🔥 IMPORTANT

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



//  LOGOUT
exports.logout = async (req, res) => {
  try {

    //send notification 

    await sendNotification({
      userId: req.user._id,
      message: "You logged out successfully ",
      type:"info"
    });

    //email notification

    await sendEmail(
  req.user.email,
  "Logout Alert ",
  `Hi ${req.user.name}, you logged out successfully.`
);

    res.json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



//forgot password

exports.forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user)
    return res.status(404).json({ message: "User not found" });

  const token = crypto.randomBytes(32).toString("hex");

  user.resetToken = token;
  user.resetExpire = Date.now() + 10 * 60 * 1000;

  await user.save();

  const link = `https://aquamarine-biscochitos-2b8086.netlify.app/${token}`;

  await sendEmail(
    user.email,
    "Reset Password",
    `Click here: ${link}`
  );

  res.json({ message: "Reset link sent" });
};

//reset password

exports.resetPassword = async (req, res) => {
  const user = await User.findOne({
    resetToken: req.params.token,
    resetExpire: { $gt: Date.now() }
  });

  if (!user)
    return res.status(400).json({ message: "Invalid token" });

  user.password = await bcrypt.hash(req.body.password, 10);

  user.resetToken = undefined;
  user.resetExpire = undefined;

  await user.save();

  res.json({ message: "Password updated" });
};