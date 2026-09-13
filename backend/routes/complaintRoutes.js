const express = require("express");
const router = express.Router();

const Complaint = require("../models/Complaint");
const Activity = require("../models/Activity");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

// @route   GET /api/complaints
// @desc    Students see only their own complaints. Admins see all complaints.
router.get("/", protect, async (req, res) => {
  try {
    const query = req.user.role === "admin" ? {} : { userId: req.user.id };
    const complaints = await Complaint.find(query)
      .populate("userId", "name studentId department")
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: "Unable to load complaints. Please try again." });
  }
});

// @route   POST /api/complaints
// @desc    Submit a new complaint
router.post("/", protect, async (req, res) => {
  try {
    const { category, subject, description, priority, location } = req.body;

    if (!category || !subject || !description) {
      return res.status(400).json({ message: "Please fill in all required fields." });
    }

    const complaint = await Complaint.create({
      userId: req.user.id,
      category,
      subject,
      description,
      priority: priority || "Medium",
      location: location || "",
    });

    await Activity.create({
      userId: req.user.id,
      action: "Complaint Submitted",
      description: `Submitted complaint: ${subject}`,
    });

    res.status(201).json({ message: "Complaint submitted successfully!", complaint });
  } catch (error) {
    res.status(500).json({ message: "Unable to submit your complaint. Please try again." });
  }
});

// @route   GET /api/complaints/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate("userId", "name studentId department");
    if (!complaint) return res.status(404).json({ message: "Complaint not found." });

    // students can only view their own complaint
    if (req.user.role !== "admin" && complaint.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied." });
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: "Unable to load complaint details." });
  }
});

// @route   PUT /api/complaints/:id
// @desc    Admin updates status/response of a complaint
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { status, adminResponse } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status, adminResponse },
      { new: true }
    );
    if (!complaint) return res.status(404).json({ message: "Complaint not found." });

    await Activity.create({
      userId: complaint.userId,
      action: "Complaint Updated",
      description: `Complaint "${complaint.subject}" marked as ${status}`,
    });

    res.json({ message: "Complaint updated successfully!", complaint });
  } catch (error) {
    res.status(500).json({ message: "Unable to update complaint." });
  }
});

// @route   DELETE /api/complaints/:id
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found." });
    res.json({ message: "Complaint deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Unable to delete complaint." });
  }
});

module.exports = router;
