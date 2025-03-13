const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const User = require("../models/user"); // Import User model



const router = express.Router();

// Configure Multer for file uploads
const upload = multer({ dest: "uploads/" });

// POST route to parse resume
router.post("/parse-resume", upload.single("resume"), async (req, res) => {
  try {
    // Read the uploaded file
    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);

    // Parse the PDF file
    const pdfData = await pdfParse(fileBuffer);

    // Example parsing logic (basic demo)
    const extractedData = {
      fileName:req.file.originalname,
      name: extractName(pdfData.text),
      email: extractEmail(pdfData.text),
      phone: extractPhone(pdfData.text),
    };

    // Delete the file after parsing
    fs.unlinkSync(filePath);

    // Respond with the parsed data
    res.status(200).json(extractedData);
  } catch (err) {
    res.status(500).json({ error: "Failed to parse resume." });
  }
});

// Helper Functions
const extractName = (text) => {
  const match = text.match(/Name:\s*(.*)/);
  return match ? match[1] : "N/A";
};

const extractEmail = (text) => {
  const match = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  return match ? match[0] : "N/A";
};

const extractPhone = (text) => {
  const match = text.match(/(\+?\d{1,2}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  return match ? match[0] : "N/A";
};


router.post('/save-parsed-resume', async (req, res) => {
  const { userId, parsedData } = req.body;
  try {
    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Create a new parsed resume with a title and current date
    const newParsedResume = {
      title: `Resume ${user.parsedResumes.length + 1}`,  // Title based on the number of existing resumes
      date: new Date(),
      parsedData: parsedData,  // The parsed resume data
    };

    // Push the new parsed resume to the user's parsedResumes array
    user.parsedResumes.push(newParsedResume);

    // Save the user document with the updated parsedResumes
    await user.save();

    // Send the updated parsed resumes back in the response
    res.json({ message: 'Parsed resume saved successfully!', parsedResumes: user.parsedResumes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to save parsed resume.' });
  }
});



module.exports = router;
