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

router.post('/save-parsed-resume', async (req, res) => {
  const { userId, parsedData } = req.body;

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Assign (or replace) the parsedResume data
    user.parsedResume = {
      name: parsedData.name || user.parsedResume?.name || "N/A",
      email: parsedData.email || user.parsedResume?.email || "N/A",
      phone: parsedData.phone || user.parsedResume?.phone || "N/A",
      linkedIn: parsedData.linkedIn || user.parsedResume?.linkedIn || "N/A",
      github: parsedData.github || user.parsedResume?.github || "N/A",
      skills: parsedData.skills?.length ? parsedData.skills : user.parsedResume?.skills || [],
      workExperience: parsedData.workExperience?.length ? parsedData.workExperience : user.parsedResume?.workExperience || [],
      education: parsedData.education?.length ? parsedData.education : user.parsedResume?.education || [],
    };

    // Save the updated user document
    await user.save();

    // Send the updated parsed resume back in the response
    res.json({ message: 'Parsed resume saved successfully!', parsedResume: user.parsedResume });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to save parsed resume.' });
  }
});

router.post("/getparsedresume", async (req, res) => {
  try {
    console.log("🟢 Received request body:", req.body);

    const { userId } = req.body;
    if (!userId) {
      console.log("❌ User ID missing in request");
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    console.log("🟢 User found:", user);

    if (!user) {
      console.log("❌ User not found in database");
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.parsedResume) {
      console.log("❌ User found but parsedResume is missing");
      return res.status(404).json({ message: "Parsed resume not found" });
    }

    console.log("✅ Sending parsed resume:", JSON.stringify(user.parsedResume, null, 2));

    // Return the parsed resume data
    res.status(200).json({ parsedResume: user.parsedResume });

  } catch (error) {
    console.error("❌ Error fetching parsed resume:", error);
    res.status(500).json({ message: "Server Error", error });
  }
});





router.post('/', async (req, res) => {
  try {
      const { userId } = req.body; // Get user ID from frontend
      const user = await User.findById(userId);

      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      res.json({ parsedResumes: user.parsedResumes });
  } catch (error) {
      res.status(500).json({ message: "Server Error", error });
  }
});

router.get("/", (req, res) => {
  res.send("Working");
});



module.exports = router;


