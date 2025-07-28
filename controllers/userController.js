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
      // SỬA LỖI: KHÔNG TRẢ VỀ TOKEN KHI ĐĂNG KÝ
      res.status(201).json({
        message: "Registration successful! Please log in.", // Thông báo rõ ràng
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        // Không trả về phoneNumber, address, role nếu không cần thiết cho frontend sau đăng ký
        // Chỉ trả về những gì cần thiết để xác nhận người dùng đã được tạo
      });
    } else {
      res.status(400).json({ message: "Invalid user information!" });
    }
  } catch (err) {
    console.error("Error during user registration:", err); // Sử dụng console.error
    res.status(500).json({ message: err.message || "Server error during registration." }); // Phản hồi JSON nhất quán
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
    console.error("Error in user login:", err); // Sử dụng console.error
    res.status(500).json({ message: err.message || "Server error during login." }); // Phản hồi JSON nhất quán
  }
};

const logoutUser = async (req, res) => {
  // Nếu bạn có logic xóa token phía server (ví dụ: blacklist token), hãy thêm vào đây
  // Hiện tại, việc logout chủ yếu diễn ra ở frontend bằng cách xóa token khỏi client
  res.status(200).json({ message: "Logged out successfully (client-side token removed)." });
};

const getUser = async (req, res) => {
  const user = req.user; // req.user được gán từ middleware xác thực token
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
      // Trường hợp này hiếm khi xảy ra nếu middleware xác thực hoạt động đúng
      res.status(404).json({ message: "Authenticated user not found in request." });
    }
  } catch (err) {
    console.error("Error in get user:", err); // Sửa console.err thành console.error
    res.status(500).json({ message: err.message || "Server error while fetching user." }); // Phản hồi JSON nhất quán
  }
};

const updateProfile = async (req, res) => {
  const user = req.user; // req.user được gán từ middleware xác thực token

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
    // Không cho phép người dùng tự thay đổi vai trò qua updateProfile
    if (req.body.role && req.body.role !== user.role) {
      console.warn(
        `User ${user.email} attempted to change role to ${req.body.role}. Action denied.`
      );
      // Có thể trả về lỗi hoặc chỉ bỏ qua trường này
      // return res.status(403).json({ message: "Role cannot be changed via this endpoint." });
    }

    const updatedUser = await user.save();
    // Khi update profile, vẫn trả về token mới (nếu token cũ sắp hết hạn hoặc để refresh)
    // và thông tin user cập nhật
    res.json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      role: updatedUser.role,
      phoneNumber: updatedUser.phoneNumber,
      address: updatedUser.address,
      token: generateToken(updatedUser._id), // Vẫn giữ token ở đây
      message: "Profile updated successfully",
    });
  } catch (err) {
    console.error("Error in update profile:", err); // Sử dụng console.error
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({ message });
    }
    res.status(500).json({ message: err.message || "Server error during profile update." }); // Phản hồi JSON nhất quán
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  updateProfile,
};
