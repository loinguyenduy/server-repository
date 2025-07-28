const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
  let token;
  //check if header authorization exists or start with bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      //get token from header authorization
      token = req.headers.authorization.split(" ")[1];
      //decode token code
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      //find user based on ID from token
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found!" });
      }
      next();
    } catch (err) {
      console.log("Error in auth middleware: ", err);
      res.status(401).json({ message: "Token failed or expired!" });
    }
  } else {
    res.status(401).json({ message: "Not authorized!" });
  }
};

const admin = async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized. Access denied!" });
  }
};
module.exports = { protect, admin };
