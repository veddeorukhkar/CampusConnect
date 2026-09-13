const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Complaint = require("../models/Complaint");
const ServiceRequest = require("../models/ServiceRequest");
const Event = require("../models/Event");
const Activity = require("../models/Activity");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

// All routes below require the user to be logged in AND be an admin
router.use(protect, adminOnly);

// @route   GET /api/admin/stats
// @desc    Top-level KPI numbers for the admin dashboard
router.get("/stats", async (req, res) => {
  try {
    const [totalStudents, totalComplaints, pendingComplaints, resolvedComplaints, totalRequests, activeEvents] =
      await Promise.all([
        User.countDocuments({ role: "student" }),
        Complaint.countDocuments(),
        Complaint.countDocuments({ status: "Pending" }),
        Complaint.countDocuments({ status: "Resolved" }),
        ServiceRequest.countDocuments(),
        Event.countDocuments(),
      ]);

    res.json({ totalStudents, totalComplaints, pendingComplaints, resolvedComplaints, totalRequests, activeEvents });
  } catch (error) {
    res.status(500).json({ message: "Unable to load dashboard statistics." });
  }
});

// @route   GET /api/admin/students
router.get("/students", async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("-password").sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Unable to load students." });
  }
});

// @route   PUT /api/admin/students/:id/status
// @desc    Toggle a student's active/inactive status
router.put("/students/:id/status", async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found." });
    student.isActive = !student.isActive;
    await student.save();
    res.json({ message: "Student status updated.", student });
  } catch (error) {
    res.status(500).json({ message: "Unable to update student status." });
  }
});

// @route   GET /api/admin/analytics
// @desc    Data used to build the charts on the analytics page
router.get("/analytics", async (req, res) => {
  try {
    // Complaints grouped by category
    const complaintsByCategory = await Complaint.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    // Complaints grouped by status (for the doughnut chart)
    const complaintsByStatus = await Complaint.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Requests grouped by category
    const requestsByCategory = await ServiceRequest.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    // Monthly trend for complaints (last 6 months) grouped by month string
    const complaintsMonthly = await Complaint.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Department-wise student count
    const studentsByDepartment = await User.aggregate([
      { $match: { role: "student" } },
      { $group: { _id: "$department", count: { $sum: 1 } } },
    ]);

    res.json({
      complaintsByCategory,
      complaintsByStatus,
      requestsByCategory,
      complaintsMonthly,
      studentsByDepartment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to load analytics." });
  }
});

// @route   GET /api/admin/activity
// @desc    Recent activity feed across the whole platform
router.get("/activity", async (req, res) => {
  try {
    const activity = await Activity.find()
      .populate("userId", "name studentId")
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: "Unable to load activity feed." });
  }
});

module.exports = router;
