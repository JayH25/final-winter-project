const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const fs = require("fs");

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

module.exports = router;
