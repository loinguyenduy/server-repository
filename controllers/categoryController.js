const Category = require("../models/categoryModel.js");

/////////
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (err) {
    res.status(500).send(err);
  }
};

///////////
const getCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await Category.findById(categoryId);
    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ message: "Category not found!" });
    }
  } catch (err) {
    res.status(500).send(err);
  }
};

///////////////
const createCategory = async (req, res) => {
  const { name } = req.body;
  const existingCategory = await Category.findOne({ name });

  if (existingCategory) {
    return res.status(400).json({ message: "Category name already exists" });
  }

  // const category = new Category({ name });

  try {
    const createdCategory = await Category.create({ name });
    res.status(201).json(createdCategory);
  } catch (error) {
    res.status(400).send(err);
  }
};

/////////////////
const updateCategory = async (req, res) => {
  const { name } = req.body;
  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      category.name = name || category.name;

      const updatedCategory = await category.save();
      res.json(updatedCategory);
    } else {
      res.status(404).json({ message: "Category not found" });
    }
  } catch (err) {
    res.status(400).send(err)
  }
};
////////////////
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      await category.deleteOne();
      res.json({ message: "Category removed" });
    } else {
      res.status(404).json({ "message": "Category not found" });
    }
  } catch (err) {
    res.status(500).send(err)
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
