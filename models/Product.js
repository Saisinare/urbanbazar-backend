const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: Array,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  subcategory:{
    type: String,
  },
  seller: {
    type: mongoose.Types.ObjectId,
    ref:'User',
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  review: [
    {
      reviewer_name: String,
      rating: Number,
      date: Date,
      rating_out_of_5: Number,
    },
  ],
  product_quantity: {
    type: Number,
    required: true,
  },
});


module.exports = mongoose.model("Product", ProductSchema);
