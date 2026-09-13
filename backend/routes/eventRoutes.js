const express = require("express");
const router = express.Router();

const Event = require("../models/Event");
const EventRegistration = require("../models/EventRegistration");
const Activity = require("../models/Activity");
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

// @route   GET /api/events/my-registrations
router.get("/my-registrations", protect, async (req, res) => {
  try {
    const registrations = await EventRegistration.find({ userId: req.user.id });
    res.json(registrations.map((r) => r.eventId));
  } catch (error) {
    res.status(500).json({ message: "Unable to load your registrations." });
  }
});

// @route   POST /api/events/:id/register
router.post("/:id/register", protect, async (req, res) => {
  try {
    const { phone, guests } = req.body;
    if (!phone) return res.status(400).json({ message: "Please provide a contact number." });

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found." });

    const existing = await EventRegistration.findOne({ eventId: req.params.id, userId: req.user.id });
    if (existing) return res.status(400).json({ message: "You're already registered for this event." });

    const registration = await EventRegistration.create({
      eventId: req.params.id,
      userId: req.user.id,
      phone,
      guests: guests || 1,
    });

    await Activity.create({
      userId: req.user.id,
      action: "Event Registration",
      description: `Registered for event: ${event.title}`,
    });

    res.status(201).json({ message: "Registered successfully!", registration });
  } catch (error) {
    res.status(500).json({ message: "Unable to register for this event. Please try again." });
  }
});

// @route   GET /api/events/:id/registrations (admin only)
router.get("/:id/registrations", protect, adminOnly, async (req, res) => {
  try {
    const registrations = await EventRegistration.find({ eventId: req.params.id })
      .populate("userId", "name studentId email department")
      .sort({ createdAt: -1 });
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: "Unable to load registrations." });
  }
});

module.exports = router;
