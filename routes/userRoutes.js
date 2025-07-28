const UserController = require("../controllers/userController");
const { protect } = require("../middleware/auth");
const User = require("../models/userModel");

const UserRoute = (app) => {
  app.route("/api/users/register").post(UserController.registerUser);

  app.route("/api/users/login").post(UserController.loginUser);

  app
    .route("/api/users/profile")
    .get(protect, UserController.getUser)
    .put(protect, UserController.updateProfile);
};

module.exports = UserRoute;
