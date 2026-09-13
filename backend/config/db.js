// This file handles connecting our backend to the MongoDB database.
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // mongoose.connect uses the connection string stored in our .env file
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    // If the database can't connect, there's no point running the server
    process.exit(1);
  }
};

module.exports = connectDB;
