const Product = require("../models/productModel.js");
const Category = require("../models/categoryModel.js");

// get all products
// const getAllProducts = async (req, res) => {
//   try {
//     const products = await Product.find({}).populate("category", "name");
//     res.json(products);
//   } catch (err) {
//     res.status(500).send(err);
//   }
// };

const getAllProducts = async (req, res) => {
  try {
    const categoryName = req.query.category;
    const isFeaturedQuery = req.query.isFeatured;
    const keyword = req.query.keyword;
    const page = parseInt(req.query.page) || 1; //amount of page
    const limit = parseInt(req.query.limit) || 10; // amount of product each page

    let query = {};

    if (categoryName && categoryName !== "All") {
      const categoryDoc = await Category.findOne({ name: categoryName });

      if (categoryDoc) {
        query.category = categoryDoc._id;
      } else {
        return res.json({
          products: [],
          page: 1,
          pages: 1,
          totalProducts: 0,
          limit: limit,
        });
      }
    }

    if (isFeaturedQuery !== undefined) {
      query.isFeatured = isFeaturedQuery === "true";
    }

    if (keyword) {
      query.name = {
        $regex: keyword,
        $options: "i",
      };
    }

    const option = {
      page: page,
      limit: limit,
      populate: {
        path: "category",
        select: "name",
      },
      sort: { createdAt: -1 },
    };

    const result = await Product.paginate(query, option);
    res.json({
      products: result.docs,
      page: result.page,
      pages: result.totalPages,
      totalProducts: result.totalDocs,
      limit: result.limit,
    });
  } catch (err) {
    res.status(500).send(err);
  }
};

// get product by id
const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId).populate(
      "category",
      "name"
    );
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found!" });
    }
  } catch (err) {
    res.status(500).send(err);
  }
};

////////// create product
const createProduct = async (req, res) => {
  const {
    name,
    description,
    price,
    category: categoryId,
    isFeatured,
  } = req.body;
  const existingCategory = await Category.findById(categoryId);

  //check categoryId
  if (!existingCategory) {
    return res.status(400).json({ message: "Invalid category ID!" });
  }

  //check name of product
  const existingName = await Product.findOne({ name, category: categoryId });
  if (existingName) {
    return res
      .status(400)
      .json({ message: "Product with this name already exists!" });
  }

  // handle function of uploading images
  const imagePath = req.file
    ? `/uploads/${req.file.filename}`
    : "placeholder.jpg";

  const product = new Product({
    name,
    description,
    price,
    image: imagePath,
    category: categoryId,
    isFeatured: isFeatured !== undefined ? isFeatured : true,
  });

  try {
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (err) {
    res.status(400).send(err);
  }
};

////// update product
const updateProduct = async (req, res) => {
  const {
    name,
    description,
    price,
    category: categoryId,
    isFeatured,
  } = req.body;
  const imagePath = req.file ? `uploads/${req.file.filename}` : undefined;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      if (categoryId && categoryId !== product.category.toString()) {
        const existingCategory = await Category.findById(categoryId);
        if (!existingCategory) {
          return res.status(400).json({ message: "Invalid category ID!" });
        }
        product.category = categoryId;
      }
      product.name = name !== undefined ? name : product.name;
      product.description =
        description !== undefined ? description : product.description;
      product.price = price !== undefined ? price : product.price;
      product.isFeatured =
        isFeatured !== undefined ? isFeatured : product.isFeatured;

      if (imagePath) {
        product.image = imagePath;
      }

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found!" });
    }
  } catch (err) {
    res.status(400).send(err);
  }
};

////// delete product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.json({ message: "Product removed successfully!" });
    } else {
      res.status(404).json({ message: "Product not found!" });
    }
  } catch (err) {
    res.status(500).send(err);
  }
};

// search product by keyword
// const searchProduct = async (req, res) => {
//   try {
//     const keyword = req.query.keyword;
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     if (!keyword) {
//       return res
//         .status(400)
//         .json({ message: "Please provide a keyword for search." });
//     }

//     const query = {
//       name: {
//         $regex: keyword,
//         $options: "i",
//       },
//     };

//     const options = {
//       page: page,
//       limit: limit,
//     };

//     const result = await Product.paginate(query, options);

//     if (result.docs.length === 0 && result.totalDocs === 0) {
//       return res.status(404).json({ message: "Cannot found this product." });
//     }

//     res.json({
//       products: result.docs,
//       page: result.page,
//       pages: result.totalPages,
//       totalProducts: result.totalDocs,
//       limit: result.limit,
//     });
//   } catch (err) {
//     res.status(500).send(err);
//   }
// };

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  // searchProduct,
};
