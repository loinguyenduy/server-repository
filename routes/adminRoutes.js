const AdminController = require("../controllers/adminController")
const {protect, admin} = require("../middleware/auth")

const AdminRoute = (app) => {
  app.route("/api/admin/users")
  .get(protect, admin, AdminController.getAllUsers)

  app.route("/api/admin/users/:id")
  .get(protect, admin, AdminController.getUserById)
  .put(protect, admin, AdminController.updateUser)
  .delete(protect, admin, AdminController.deleteUser)
}

module.exports = AdminRoute