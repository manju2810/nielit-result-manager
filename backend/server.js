const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const dns = require("dns");
const connectDB = require("./config/db");

// Load env vars
dotenv.config();

// Fix DNS
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/results/upload", require("./routes/uploadRoutes"));
app.use("/api/results", require("./routes/resultRoutes"));
app.use("/api/activity", require("./routes/activityRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

// Test route
app.get("/", (req, res) => {
  res.json({ message: "NIELIT Result Manager API is running!" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});