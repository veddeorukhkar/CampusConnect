// This file defines the "shape" of a User document in MongoDB.
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    studentId: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // this will always be a bcrypt HASH, never plain text
    department: { type: String, required: true },
    year: { type: String, required: true },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    profileImage: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true } // automatically adds createdAt and updatedAt fields
);

module.exports = mongoose.model("User", userSchema);
