const express = require("express");
const cors = require("cors");
const parseResumeRoute = require("./routes/parseResume");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors()); // Allows requests from the frontend
app.use(express.json());

// Routes
app.use("/api", parseResumeRoute);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
