const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true }, // e.g. "Complaint Submitted", "Login"
    description: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);
