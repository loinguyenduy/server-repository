const User = require("../models/userModel");

const getAllUsers = async (req, res) => {
  try {
    const user = await User.find({}).select("-password");
    res.json(user);
  } catch (err) {
    console.log("Err in get all user", err);
    res.status(500).send(err);
  }
};

const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("-password");

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found!" });
    }
  } catch (err) {
    console.log("Error in get user by id: ", err);

    if (err.name === "CastError" && err.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid ID format!" });
    }
    res.status(500).send(err);
  }
};

const updateUser = async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId).select("+password");
  try {
    user.fullName = req.body.fullName ?? user.fullName;
    user.phoneNumber = req.body.phoneNumber ?? user.phoneNumber;
    user.address = req.body.address ?? user.address;
    user.role = req.body.role ?? user.role;
    if (req.body.message && req.body.email !== user.email) {
      const existingEmail = await User.findOne({ email: req.body.email });
      if (existingEmail && String(existingEmail._id) !== String(user._id)) {
        return res.status(400).json({ message: "Email is already in use!" });
      }
      user.email = req.body.email;
    }

    if (req.body.newPassword) {
      user.password = req.body.newPassword;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      role: updatedUser.role,
      phoneNumber: updatedUser.phoneNumber,
      address: updatedUser.address,
      message: "User updated successfully",
    });
  } catch (err) {
    console.log("Error in update user by id: ", err);
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({ message });
    }
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (user) {
      await user.deleteOne();
      res.json({ message: "User removed successfully!" });
    } else {
      res.status(404).json({ message: "User not found!" });
    }
  } catch (err) {
    console.log("Error in delete user: ", err);
    if (err.name === "CastError" && err.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid User ID format!" });
    }
    res.status(500).send(err);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
}