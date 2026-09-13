const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true }, // e.g. Hostel, Academics, Infrastructure, IT, Library
    subject: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    location: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved", "Rejected"],
      default: "Pending",
    },
    adminResponse: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);
