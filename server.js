const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const dns = require("dns");
const connectDB = require("./config/db");
const userRoutes=require("./routes/userRoutes");
const maintenanceRoutes=require("./routes/maintenanceRoutes");


// Fix DNS
dns.setServers([
  "1.1.1.1",
  "8.8.8.8"
]);


// Load env first
dotenv.config();

// Connect DB
connectDB();

const app = express();

// ✅ VERY IMPORTANT
app.use(express.json());

// ✅ Body parser (VERY IMPORTANT)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors());

// ✅ Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/test", require("./routes/testRoutes"));
app.use("/api/maintenance", require("./routes/maintenanceRoutes"));
app.use("/api/rooms", require("./routes/roomRoutes"));
app.use("/api/bills", require("./routes/billRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/users",userRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("API Running 🚀");
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});