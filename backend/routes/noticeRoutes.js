const express = require("express");
const router = express.Router();

const Notice = require("../models/Notice");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

// @route   GET /api/notices  (everyone logged in can view)
router.get("/", protect, async (req, res) => {
  try {
    // pinned notices show first, then newest first
    const notices = await Notice.find().sort({ pinned: -1, createdAt: -1 });
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: "Unable to load notices." });
  }
});

// @route   POST /api/notices  (admin only)
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { title, description, category, priority, pinned } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: "Please fill in the title and description." });
    }
    const notice = await Notice.create({ title, description, category, priority, pinned });
    res.status(201).json({ message: "Notice published successfully!", notice });
  } catch (error) {
    res.status(500).json({ message: "Unable to create notice." });
  }
});

// @route   PUT /api/notices/:id  (admin only)
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!notice) return res.status(404).json({ message: "Notice not found." });
    res.json({ message: "Notice updated successfully!", notice });
  } catch (error) {
    res.status(500).json({ message: "Unable to update notice." });
  }
});

// @route   DELETE /api/notices/:id  (admin only)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) return res.status(404).json({ message: "Notice not found." });
    res.json({ message: "Notice deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Unable to delete notice." });
  }
});

module.exports = router;
