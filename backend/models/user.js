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
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    linkedIn: { type: String },
    github: { type: String },
    skills: [{ type: String }], // Array of strings
    workExperience: [
      {
        company: { type: String },
        role: { type: String },
        duration: { type: String },
      },
    ],
    education: [
      {
        degree: { type: String },
        university: { type: String },
        graduationYear: { type: String },
      },
    ],
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
