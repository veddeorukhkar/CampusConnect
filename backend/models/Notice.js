const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, default: "General" }, // e.g. Academic, Exam, Event, General
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notice", noticeSchema);
