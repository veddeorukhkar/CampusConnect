// This is the main entry point of our backend application.
require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Import all our route files
const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const requestRoutes = require("./routes/requestRoutes");
const noticeRoutes = require("./routes/noticeRoutes");
const eventRoutes = require("./routes/eventRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json()); // allows the server to understand JSON request bodies

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/admin", adminRoutes);

// Serve the frontend (HTML/CSS/JS) as static files
const frontendPath = path.join(__dirname, "..", "frontend");
app.use(express.static(frontendPath));

// Any unknown non-API route falls back to index.html (simple multi-page app setup)
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Global error handler - catches anything that slips through
// so the app never crashes and shows a raw stack trace to the user
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong on the server. Please try again." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 CampusConnect server running at http://localhost:${PORT}`);
});
