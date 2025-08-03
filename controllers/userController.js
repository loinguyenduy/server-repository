const User = require("../models/userModel.js");
const generateToken = require("../utils/generateToken.js");

const registerUser = async (req, res) => {
  const { fullName, email, password, phoneNumber, address, role } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists!" });
    }
    const user = await User.create({
      fullName,
      email,
      password,
      phoneNumber,
      address,
      role: role || "user",
    });
    if (user) {
      res.status(201).json({
        message: "Registration successful! Please log in.", 
        _id: user._id,
        fullName: user.fullName,
        email: user.email,

      });
    } else {
      res.status(400).json({ message: "Invalid user information!" });
    }
  } catch (err) {
    console.error("Error during user registration:", err); 
    res.status(500).json({ message: err.message || "Server error during registration." }); 
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select("+password");
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password!" });
    }
  } catch (err) {
    console.error("Error in user login:", err); 
    res.status(500).json({ message: err.message || "Server error during login." }); 
  }
};

const logoutUser = async (req, res) => {
  res.status(200).json({ message: "Logged out successfully (client-side token removed)." });
};

const getUser = async (req, res) => {
  const user = req.user; 
  try {
    if (user) {
      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        role: user.role,
      });
    } else {
      res.status(404).json({ message: "Authenticated user not found in request." });
    }
  } catch (err) {
    console.error("Error in get user:", err); 
    res.status(500).json({ message: err.message || "Server error while fetching user." }); 
  }
};

const updateProfile = async (req, res) => {
  const user = req.user; 

  try {
    user.fullName = req.body.fullName || user.fullName;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
    user.address = req.body.address || user.address;

    if (req.body.email && req.body.email !== user.email) {
      const existingEmail = await User.findOne({ email: req.body.email });
      if (existingEmail && String(existingEmail._id) !== String(user._id)) {
        return res.status(400).json({ message: "Email is already in use!" });
      }
      user.email = req.body.email;
    }

    if (req.body.currentPassword || req.body.newPassword) {
      if (!req.body.currentPassword || !req.body.newPassword) {
        return res
          .status(400)
          .json({
            message:
              "Please provide both current password and new password to update password",
          });
      }
      const verifyPassword = await User.findById(user._id).select("+password");

      if (
        !verifyPassword ||
        !(await verifyPassword.matchPassword(req.body.currentPassword))
      ) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }
      user.password = req.body.newPassword;
    }
    if (req.body.role && req.body.role !== user.role) {
      console.warn(
        `User ${user.email} attempted to change role to ${req.body.role}. Action denied.`
      );

    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      role: updatedUser.role,
      phoneNumber: updatedUser.phoneNumber,
      address: updatedUser.address,
      token: generateToken(updatedUser._id), 
      message: "Profile updated successfully",
    });
  } catch (err) {
    console.error("Error in update profile:", err); 
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({ message });
    }
    res.status(500).json({ message: err.message || "Server error during profile update." }); 
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  updateProfile,
};
