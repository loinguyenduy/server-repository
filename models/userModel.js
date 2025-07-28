//import mongoose library
const mongoose = require("mongoose")
const bcrypt = require('bcryptjs') // library to hash password
const UserSchema = mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Username cannot be empty!"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email cannot be empty!"],
    unique: true,
    lowercase: true,
    match: [/.+@.+\..+/, "Please ...."]
  },
  password: {
    type: String,
    required: [true, "Password cannot be empty!"],
    minlength: [6, "Password must be at least 6 characters long."],
    select: false,
  },
  role:{
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  phoneNumber: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  }
},
{
  versionKey: false,
  timestamps: true,
})

UserSchema.pre('save', async function(next) {
  if(!this.isModified('password')){
    return next()
  }
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

UserSchema.methods.matchPassword = async function(enteredPassword){
  return await bcrypt.compare(enteredPassword, this.password)
}

const User = mongoose.model("users", UserSchema)
module.exports = User