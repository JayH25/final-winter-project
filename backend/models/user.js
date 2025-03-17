const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  parsedResume: {
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    linkedIn: { type: String, default: "" },
    github: { type: String, default: "" },
    skills: { type: [String], default: [] }, // Default empty array
    workExperience: {
      type: [
        {
          company: { type: String, default: "" },
          role: { type: String, default: "" },
          duration: { type: String, default: "" },
        },
      ],
      default: [],
    },
    education: {
      type: [
        {
          degree: { type: String, default: "" },
          university: { type: String, default: "" },
          graduationYear: { type: String, default: "" },
        },
      ],
      default: [],
    },
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
