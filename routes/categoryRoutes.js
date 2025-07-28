const CategoryController = require('../controllers/categoryController');
const {protect, admin} = require("../middleware/auth")

const CategoryRoute = (app) => {
  app.route("/api/categories")
    .get(CategoryController.getAllCategories)
    .post(protect, admin,CategoryController.createCategory);

  app.route("/api/categories/:id")
    .get(CategoryController.getCategoryById)
    .put(protect, admin,CategoryController.updateCategory)
    .delete(protect, admin,CategoryController.deleteCategory);

};

module.exports = CategoryRoute;