const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const User = require("./models/user"); // Import User model
const parseResumeRoute = require("./routes/parseResume"); // Route for parsing resumes
const userRoute = require("./routes/user"); // User-related routes

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files from /public
app.use(express.static(path.join(__dirname, "public")));

// Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/user")
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// API Routes
app.use("/api", parseResumeRoute); // For parsing resume-related requests
app.use("/user", userRoute); // For user-related operations

// GET /user/:userId - Render dashboard with parsedResume data
app.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  const { message, isSuccess } = req.query; // Get message from query params

  try {
    const user = await User.findById(userId).select("parsedResume");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Render the EJS file with parsedResume and optional message
    res.render("dashboard", {
      parsedResume: user.parsedResume,
      userId,
      message,
      isSuccess,
    });
  } catch (error) {
    console.error("Error fetching parsed resume:", error);
    res.status(500).json({ message: "Error fetching parsed resume", error });
  }
});

// POST /update-resume/:userId - Update parsed resume and redirect with message
app.post("/update-resume/:userId", async (req, res) => {
  const { userId } = req.params;
  const updatedResume = req.body;

  // Convert skills to array format (split by comma)
  if (updatedResume.skills) {
    updatedResume.skills = updatedResume.skills.split(",").map((skill) => skill.trim());
  }

  try {
    // Update only parsedResume fields
    await User.findByIdAndUpdate(userId, { parsedResume: updatedResume });

    // Redirect to dashboard with success message
    res.redirect(`/user/${userId}?message=Resume updated successfully!&isSuccess=true`);
  } catch (error) {
    console.error("Error updating parsed resume:", error);
    res.redirect(`/user/${userId}?message=Error updating resume!&isSuccess=false`);
  }
});

// Test Route
app.get("/", (req, res) => {
  res.send("✅ Server is working correctly.");
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
