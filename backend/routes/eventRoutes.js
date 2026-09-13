const express = require("express");
const router = express.Router();

const Event = require("../models/Event");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

// @route   GET /api/events  (everyone logged in can view)
router.get("/", protect, async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Unable to load events." });
  }
});

// @route   POST /api/events  (admin only)
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { title, description, date, time, location, category } = req.body;
    if (!title || !description || !date || !time || !location) {
      return res.status(400).json({ message: "Please fill in all required fields." });
    }
    const event = await Event.create({ title, description, date, time, location, category });
    res.status(201).json({ message: "Event created successfully!", event });
  } catch (error) {
    res.status(500).json({ message: "Unable to create event." });
  }
});

// @route   PUT /api/events/:id  (admin only)
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ message: "Event not found." });
    res.json({ message: "Event updated successfully!", event });
  } catch (error) {
    res.status(500).json({ message: "Unable to update event." });
  }
});

// @route   DELETE /api/events/:id  (admin only)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found." });
    res.json({ message: "Event deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Unable to delete event." });
  }
});

module.exports = router;
