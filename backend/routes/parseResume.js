const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const User = require("../models/user");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/parse-resume", upload.single("resume"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(fileBuffer);

    const extractedData = {
      fileName: req.file.originalname,
      name: extractName(pdfData.text),
      email: extractEmail(pdfData.text),
      phone: extractPhone(pdfData.text),
      linkedIn: extractLinkedIn(pdfData.text),
      github: extractGitHub(pdfData.text),
      skills: extractSkills(pdfData.text),
      workExperience: extractWorkExperience(pdfData.text),
      education: extractEducation(pdfData.text),
    };

    fs.unlinkSync(filePath);

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

const extractLinkedIn = (text) => {
  const match = text.match(/(https?:\/\/(www\.)?linkedin\.com\/[^\s]+)/);
  return match ? match[0] : "N/A";
};

const extractGitHub = (text) => {
  const match = text.match(/(https?:\/\/(www\.)?github\.com\/[^\s]+)/);
  return match ? match[0] : "N/A";
};

const extractSkills = (text) => {
  const match = text.match(/Skills:([\s\S]*?)(?=\n\n|\n[A-Z])/);
  return match ? match[1].trim().split(/,\s*/) : [];
};

const extractWorkExperience = (text) => {
  const match = text.match(/Experience:(.*?)Education:/s);
  if (!match) return [];

  return match[1]
    .trim()
    .split("\n")
    .map((line) => {
      const parts = line.match(/(.+?)\s*-\s*(.+?)\s*\((.+?)\)/);
      return parts
        ? { company: parts[1], role: parts[2], duration: parts[3] }
        : null;
    })
    .filter(Boolean);
};

const extractEducation = (text) => {
  const match = text.match(/Education:(.*?)\n\n/s);
  if (!match) return [];

  return match[1]
    .trim()
    .split("\n")
    .map((line) => {
      const parts = line.match(/(.+?),\s*(.+?)\s*\((\d{4})\)/);
      return parts
        ? { degree: parts[1], university: parts[2], graduationYear: parts[3] }
        : null;
    })
    .filter(Boolean);
};

module.exports = router;
