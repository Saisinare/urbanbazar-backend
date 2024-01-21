const mongoose = require('mongoose');

// Define the Order schema
const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  type:{
    type: String,
    enum: ['single', 'cart'], 
    required: true,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', 
        required: true,
      },
      quantity: Number,
      amountTotal: Number,
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  orderDate: {
    type: Date,
    required: true,
  },
  ShipppingDate:{
    type:Date,
    required:true
  },
  Status: {
    type: String,
    enum: ['pending', 'shipped', 'delivered'], 
    required: true,
  },
  paymentStatus:{
    type:String,
    enum:['paid','pending']
  },
  session:String
});


const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
