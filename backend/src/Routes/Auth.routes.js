import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../Models/Auth.model.js";
import { forgotPassword, resetPassword } from "../Controller/user.controller.js";
const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, agNumber } = req.body;

    if (!name || !email || !password || !agNumber) {
      return res.status(400).json({
        success: false,
        message: "All fields including AG Number are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const normalizedAgNumber = agNumber.trim().toUpperCase();
    const existingAg = await User.findOne({ agNumber: normalizedAgNumber });
    if (existingAg) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this AG Number",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      agNumber: normalizedAgNumber,
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Register Error:", error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// LOGIN (Supports both Email and AG Number)
router.post("/login", async (req, res) => {
  try {
    const { identifier, email, password } = req.body;
    const loginField = (identifier || email || "").trim();

    if (!loginField || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const lowerEmail = loginField.toLowerCase();
    const upperAg = loginField.toUpperCase();

    const user = await User.findOne({
      $or: [
        { email: lowerEmail },
        { agNumber: upperAg }
      ]
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid Credentials" });
    }

    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.SECRET_TOKEN,
      { expiresIn: "1d" },
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        agNumber: user.agNumber || null,
        semester: user.semester || "Semester 1",
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;