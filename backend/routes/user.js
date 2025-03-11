const express = require("express");
const User = require("../models/user");

const router = express.Router();

router.post("/signup", async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already in use! Please Sign-In" });
        }

        // Create new user
        await User.create({ name: fullName, email, password });

        res.status(201).json({ message: "User created successfully!" });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "User not found! Please Sign-Up" });
        }

        // Validate password (assuming plain text password for now, consider hashing)
        if (user.password !== password) {
            return res.status(401).json({ error: "Invalid password" });
        }

        res.status(200).json({ message: "Login successful", user });
    } catch (error) {
        console.error("Signin error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;

