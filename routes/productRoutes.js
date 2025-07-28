const multer = require("multer");
const path = require("path");
const ProductController = require("../controllers/productController");
const {protect, admin} = require("../middleware/auth")
// const { fileURLToPath } = require("url")

// config multer to save image
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// handle type file
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("Only images (jpeg, jpg, png, gif) are allowed!"), false);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const ProductRoute = (app) => {
  app
    .route("/api/products")
    .get(ProductController.getAllProducts)
    .post(protect, admin,upload.single("image"), ProductController.createProduct);

  // app.route("/api/products/search") 
  // .get(ProductController.searchProduct)

  app
    .route("/api/products/:id")
    .get(ProductController.getProductById)
    .put(protect, admin,upload.single("image"), ProductController.updateProduct)
    .delete(protect, admin,ProductController.deleteProduct)
};

module.exports = ProductRoute;
