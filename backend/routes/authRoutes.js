const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

const User = require("../models/User");
const Activity = require("../models/Activity");
const protect = require("../middleware/authMiddleware");

// Helper function: creates a signed login token for a user
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// @route   POST /api/auth/register
// @desc    Create a new student account
router.post("/register", async (req, res) => {
  try {
    const { name, studentId, email, department, year, password, confirmPassword } = req.body;

    if (!name || !studentId || !email || !department || !year || !password) {
      return res.status(400).json({ message: "Please fill in all fields." });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { studentId }] });
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email or student ID already exists." });
    }

    // Hash the password before saving - we NEVER store plain text passwords
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      studentId,
      email,
      department,
      year,
      password: hashedPassword,
      role: "student",
    });

    await Activity.create({
      userId: newUser._id,
      action: "Account Created",
      description: `${newUser.name} registered on CampusConnect`,
    });

    const token = generateToken(newUser);

    res.status(201).json({
      message: "Registration successful!",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        studentId: newUser.studentId,
        department: newUser.department,
        year: newUser.year,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong during registration. Please try again." });
  }
});

// @route   POST /api/auth/login
// @desc    Log in an existing student or admin
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter email and password." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "This account has been deactivated." });
    }

    await Activity.create({
      userId: user._id,
      action: "Login",
      description: `${user.name} logged in`,
    });

    const token = generateToken(user);

    res.json({
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        department: user.department,
        year: user.year,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong during login. Please try again." });
  }
});

// @route   GET /api/auth/me
// @desc    Get the currently logged-in user's info (used to keep them logged in on refresh)
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch your profile." });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update the logged-in user's profile
router.put("/profile", protect, async (req, res) => {
  try {
    const { name, department, year } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, department, year },
      { new: true }
    ).select("-password");
    res.json({ message: "Profile updated successfully!", user });
  } catch (error) {
    res.status(500).json({ message: "Could not update profile." });
  }
});

module.exports = router;
