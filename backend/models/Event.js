const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: String, required: true }, // stored as string e.g. "2026-09-20" for simplicity
    time: { type: String, required: true }, // e.g. "10:00 AM"
    location: { type: String, required: true },
    category: { type: String, default: "General" }, // e.g. Technical, Cultural, Sports, Workshop
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
