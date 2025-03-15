const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/user"); // Import User model
const parseResumeRoute = require("./routes/parseResume");
const userRoute = require("./routes/user");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors()); // Allows requests from the frontend
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/user")
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

// Routes
app.use("/user", userRoute);
app.use("/api", parseResumeRoute);

// GET / - Fetch all parsed resumes of all users
app.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).select("parsedResume");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.parsedResume); // Send only the parsed resume
  } catch (error) {
    res.status(500).json({ message: "Error fetching parsed resume", error });
  }
});


// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
