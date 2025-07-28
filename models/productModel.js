const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const ProductSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name cannot be empty!"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: [true, "Price cannot be empty!"],
      min: [0, "Price cannot be negative!"],
    },
    // category: {
    //   type: String,
    //   require: true,
    //   enum: ['Appetizer', 'Main Course', 'Beverage', 'Dessert'],
    //   trim: true
    // },

    image: {
      type: String,
      default: "/uploads/placeholder.jpg",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "categories",
      required: [true, "Product must belong to a category!"],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

ProductSchema.plugin(mongoosePaginate);

const Product = mongoose.model("products", ProductSchema);
module.exports = Product;
