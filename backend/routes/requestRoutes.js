const express = require("express");
const router = express.Router();

const ServiceRequest = require("../models/ServiceRequest");
const Activity = require("../models/Activity");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

// @route   GET /api/requests
router.get("/", protect, async (req, res) => {
  try {
    const query = req.user.role === "admin" ? {} : { userId: req.user.id };
    const requests = await ServiceRequest.find(query)
      .populate("userId", "name studentId department")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Unable to load service requests." });
  }
});

// @route   POST /api/requests
router.post("/", protect, async (req, res) => {
  try {
    const { category, description, priority } = req.body;
    if (!category || !description) {
      return res.status(400).json({ message: "Please fill in all required fields." });
    }

    const request = await ServiceRequest.create({
      userId: req.user.id,
      category,
      description,
      priority: priority || "Medium",
    });

    await Activity.create({
      userId: req.user.id,
      action: "Service Request Submitted",
      description: `Requested: ${category}`,
    });

    res.status(201).json({ message: "Service request submitted successfully!", request });
  } catch (error) {
    res.status(500).json({ message: "Unable to submit your request. Please try again." });
  }
});

// @route   GET /api/requests/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id).populate("userId", "name studentId department");
    if (!request) return res.status(404).json({ message: "Request not found." });

    if (req.user.role !== "admin" && request.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied." });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: "Unable to load request details." });
  }
});

// @route   PUT /api/requests/:id
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { status, adminResponse } = req.body;
    const request = await ServiceRequest.findByIdAndUpdate(
      req.params.id,
      { status, adminResponse },
      { new: true }
    );
    if (!request) return res.status(404).json({ message: "Request not found." });

    await Activity.create({
      userId: request.userId,
      action: "Service Request Updated",
      description: `Request "${request.category}" marked as ${status}`,
    });

    res.json({ message: "Request updated successfully!", request });
  } catch (error) {
    res.status(500).json({ message: "Unable to update request." });
  }
});

// @route   DELETE /api/requests/:id
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const request = await ServiceRequest.findByIdAndDelete(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found." });
    res.json({ message: "Request deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Unable to delete request." });
  }
});

module.exports = router;
