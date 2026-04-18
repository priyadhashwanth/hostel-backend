const express = require("express");
const router = express.Router();
const {register,login,logout}= require("../controllers/authController");
const {protect} = require("../middleware/authMiddleware");
const { getProfile } = require("../controllers/authController");

router.post("/register", register);
router.post("/login",login);
router.get("/me", protect, getProfile);
router.post("/logout",protect, logout);

module.exports = router;