const mongoose = require("mongoose")

const CategorySchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Category name cannot be empty!"], 
    unique: true,
    trim: true,
    maxlength: 50
  },
},
{
  versionKey: false,   
  timestamps: true     
})

const Category = mongoose.model("categories", CategorySchema)
module.exports = Category