const express = require("express");
const cors = require("cors");
const mongoose=require("mongoose");
const parseResumeRoute = require("./routes/parseResume");
const userRoute=require("./routes/user");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors()); // Allows requests from the frontend
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/user").then(() => console.log("MongoDB connected successfully"))
.catch(err => console.error("MongoDB connection error:", err));

// Routes
app.use("/user",userRoute);
app.use("/api", parseResumeRoute);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
