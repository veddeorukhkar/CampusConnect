// This script fills your database with realistic demo data so the
// project looks impressive immediately, without you typing anything by hand.
//
// Run it with:   npm run seed   (from inside the backend folder)

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");

const User = require("../models/User");
const Complaint = require("../models/Complaint");
const ServiceRequest = require("../models/ServiceRequest");
const Notice = require("../models/Notice");
const Event = require("../models/Event");
const Activity = require("../models/Activity");

const departments = ["Computer Science", "Electronics", "Mechanical", "Civil", "Business Administration"];
const complaintCategories = ["Hostel", "Academics", "Infrastructure", "IT Services", "Library", "Cafeteria"];
const requestCategories = ["ID Card Reissue", "Bonafide Certificate", "Transcript Request", "Fee Receipt", "Hostel Room Change"];
const priorities = ["Low", "Medium", "High"];
const statuses = ["Pending", "In Progress", "Resolved", "Rejected"];

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const studentNames = [
  "Aarav Sharma", "Priya Patel", "Rohan Mehta", "Ananya Iyer", "Vikram Singh",
  "Diya Reddy", "Karan Kapoor", "Sneha Nair", "Arjun Verma", "Ishita Rao",
  "Rahul Gupta", "Meera Joshi",
];

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log("🌱 Starting to seed data...");

    // Clear existing data so we always start fresh
    await Promise.all([
      User.deleteMany({}),
      Complaint.deleteMany({}),
      ServiceRequest.deleteMany({}),
      Notice.deleteMany({}),
      Event.deleteMany({}),
      Activity.deleteMany({}),
    ]);
    console.log("🧹 Cleared old data");

    // ---------- Create Admin ----------
    const adminPasswordHash = await bcrypt.hash("Admin@123", 10);
    const admin = await User.create({
      name: "Dr. Kavita Menon",
      studentId: "ADMIN001",
      email: "admin@campusconnect.com",
      password: adminPasswordHash,
      department: "Administration",
      year: "N/A",
      role: "admin",
    });

    // ---------- Create Students ----------
    const studentPasswordHash = await bcrypt.hash("Student@123", 10);
    const students = [];

    // First student uses the documented demo login
    students.push(
      await User.create({
        name: "Aditya Kumar",
        studentId: "STU2024001",
        email: "student@campusconnect.com",
        password: studentPasswordHash,
        department: "Computer Science",
        year: "3rd Year",
        role: "student",
      })
    );

    for (let i = 0; i < studentNames.length; i++) {
      const studentId = `STU2024${String(i + 2).padStart(3, "0")}`;
      const email = `${studentNames[i].toLowerCase().replace(" ", ".")}@campusconnect.com`;
      students.push(
        await User.create({
          name: studentNames[i],
          studentId,
          email,
          password: studentPasswordHash,
          department: randomFrom(departments),
          year: randomFrom(["1st Year", "2nd Year", "3rd Year", "4th Year"]),
          role: "student",
        })
      );
    }
    console.log(`👥 Created ${students.length} students + 1 admin`);

    // ---------- Create Complaints ----------
    const complaintSubjects = [
      "Water leakage in hostel bathroom", "Wi-Fi not working in library",
      "Broken chair in classroom 204", "Streetlight not working near Block C",
      "AC not cooling in computer lab", "Mess food quality is poor",
      "Projector not working in seminar hall", "Noisy construction during exams",
      "Elevator stuck on 3rd floor", "Overflowing dustbins near canteen",
      "Cracked window in dorm room", "Slow internet in Block A",
      "Leaking roof in reading hall", "Parking area poorly lit",
      "Washroom taps not working",
    ];
    for (let i = 0; i < complaintSubjects.length; i++) {
      const student = randomFrom(students);
      const status = randomFrom(statuses);
      await Complaint.create({
        userId: student._id,
        category: randomFrom(complaintCategories),
        subject: complaintSubjects[i],
        description: `${complaintSubjects[i]}. This has been an ongoing issue and needs attention from the maintenance team.`,
        priority: randomFrom(priorities),
        location: randomFrom(["Block A", "Block B", "Block C", "Main Library", "Hostel Wing 2"]),
        status,
        adminResponse: status === "Resolved" ? "Issue has been fixed by the maintenance team." : "",
      });
    }
    console.log(`📋 Created ${complaintSubjects.length} complaints`);

    // ---------- Create Service Requests ----------
    for (let i = 0; i < 12; i++) {
      const student = randomFrom(students);
      const status = randomFrom(statuses);
      await ServiceRequest.create({
        userId: student._id,
        category: randomFrom(requestCategories),
        description: `Requesting ${randomFrom(requestCategories).toLowerCase()} for official purposes.`,
        priority: randomFrom(priorities),
        status,
        adminResponse: status === "Resolved" ? "Your request has been processed and is ready for pickup." : "",
      });
    }
    console.log("🛠️  Created 12 service requests");

    // ---------- Create Notices ----------
    const notices = [
      { title: "Mid-Semester Examination Schedule Released", category: "Exam", priority: "High", pinned: true },
      { title: "Campus Wi-Fi Maintenance This Weekend", category: "IT", priority: "Medium", pinned: false },
      { title: "Library Extended Hours During Exam Week", category: "Academic", priority: "Medium", pinned: false },
      { title: "Annual Sports Day Registration Open", category: "Event", priority: "Low", pinned: false },
      { title: "Fee Payment Deadline Extended", category: "Administration", priority: "High", pinned: true },
      { title: "New Cafeteria Menu Launched", category: "General", priority: "Low", pinned: false },
      { title: "Guest Lecture on AI & Machine Learning", category: "Academic", priority: "Medium", pinned: false },
      { title: "Holiday Notice: Campus Closed for Festival", category: "General", priority: "Medium", pinned: false },
    ];
    for (const n of notices) {
      await Notice.create({
        ...n,
        description: `${n.title}. Please check the official notice board or contact the administration office for more details.`,
      });
    }
    console.log(`📢 Created ${notices.length} notices`);

    // ---------- Create Events ----------
    const events = [
      { title: "TechFest 2026 - Annual Technical Symposium", category: "Technical", location: "Main Auditorium" },
      { title: "Cultural Night - Rhythms of India", category: "Cultural", location: "Open Air Theatre" },
      { title: "Inter-College Basketball Tournament", category: "Sports", location: "Sports Complex" },
      { title: "Workshop on Full-Stack Web Development", category: "Workshop", location: "Seminar Hall B" },
      { title: "Career Fair 2026", category: "Career", location: "Central Lawn" },
      { title: "Alumni Meet & Networking Evening", category: "Networking", location: "Conference Hall" },
    ];
    for (let i = 0; i < events.length; i++) {
      const day = 10 + i * 3;
      await Event.create({
        ...events[i],
        description: `Join us for ${events[i].title}. All students are welcome to participate and register in advance.`,
        date: `2026-10-${String(day).padStart(2, "0")}`,
        time: "10:00 AM",
      });
    }
    console.log(`🎉 Created ${events.length} events`);

    // ---------- Create Activity History ----------
    for (const student of students) {
      await Activity.create({
        userId: student._id,
        action: "Account Created",
        description: `${student.name} joined CampusConnect`,
      });
    }
    console.log("🕓 Created activity history");

    console.log("\n✅ SEEDING COMPLETE!\n");
    console.log("----------------------------------------");
    console.log("DEMO LOGIN CREDENTIALS (for your viva):");
    console.log("----------------------------------------");
    console.log("ADMIN LOGIN");
    console.log("  Email:    admin@campusconnect.com");
    console.log("  Password: Admin@123");
    console.log("");
    console.log("STUDENT LOGIN");
    console.log("  Email:    student@campusconnect.com");
    console.log("  Password: Student@123");
    console.log("----------------------------------------\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();
