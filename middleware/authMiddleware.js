const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ✅ Protect Route (Authentication)
exports.protect = async (req, res, next) => {
  let token;

  try {
    // Check if token exists in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // Get token
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from DB (without password)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      return next(); // ✅ move to next middleware/route
    }

    // If no token
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