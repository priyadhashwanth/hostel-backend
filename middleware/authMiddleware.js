const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ✅ Protect Route (Authentication)

exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check token in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // Get token
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      console.log("DECODED:", decoded); // ✅ debug

      // Get user from DB
      const user = await User.findById(decoded.id || decoded._id).select("-password");

      // If user not found
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // ✅ IMPORTANT: attach user correctly
      req.user = user;

      return next();
    }

    // No token
    return res.status(401).json({ message: "No token provided" });

  } catch (error) {
    console.log("Auth Error:", error.message);
    return res.status(401).json({ message: "Not authorized" });
  }
};

// ✅ Role-based Authorization
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      next(); // ✅ allowed
    } catch (error) {
      return res.status(500).json({ message: "Authorization error" });
    }
  };
};