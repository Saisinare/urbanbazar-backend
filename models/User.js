// Import required modules
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  fullname:{
    type:String,
  },
  mobileNo: {
    type: String,
    required: true,
    unique: true,
  },
  country: {
    type: String,
  },
  pincode: {
    type: String,
  },
  state:{
    type:String,
  },
  localAddress:{
    type:String,
  },
  password: {
    type: String,
    required: true,
  },
  isSeller: {
    type: Boolean,
  },
  cart: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: Number
    },
  ],
  profilePhoto:{
    type:String
  }
});
const User = mongoose.model("User", userSchema);
module.exports = User;
