const { default: mongoose } = require("mongoose");
const Product = require("../../models/Product");
const User = require("../../models/User");
// const Review = require("../../models/Review");
const fs = require('fs')
// const Order = require("../../models/Order");
const dotenv = require("dotenv");
const { default: Stripe } = require("stripe");
const moment = require("moment");
const pdfKit = require("pdfkit");
dotenv.config();
const Strip = require("stripe")(process.env.STRIP_PRIVATE_KEY);

// exports.getProducts = async (req, res) => {
//   const filter = {};
//   if (req.query.category) {
//     filter.category = req.query.category;
//   }
//   if (req.query.minPrice) {
//     filter.price = { $gte: parseInt(req.query.minPrice) };
//   }
//   if (req.query.maxPrice) {
//     if (filter.price) {
//       filter.price.$lte = parseInt(req.query.maxPrice);
//     } else {
//       filter.price = { $lte: parseInt(req.query.maxPrice) };
//     }
//   }
//   try {
//     let products;
//     if (req.query.limit) {
//       let limit = parseInt(req.query.limit);
//       products = await Product.find(filter).limit(limit);
//     } else {
//       products = await Product.find(filter);
//       console.log(products);
//     }
//     res.status(200).json({ products: products });
//   } catch (err) {
//     console.log(err);
//   }
// };

// exports.getProduct = async (req, res) => {
//   const productId = req.params.productId;
//   try {
//     const product = await Product.findById(productId);
//     res.status(200).json({ products: product });
//   } catch (err) {
//     console.log(err);
//   }
// };

// exports.getCartProducts = async (req, res) => {
//   const userId = req.userId;

//   try {
//     const user = await User.findById(userId).populate("cart.product");
//     let totalPrice = 0,
//       productsPrice = 0,
//       tax = 0,
//       deliveryCharges = 0;
//     user.cart.forEach((item) => {
//       productsPrice += item.product.price * item.quantity;
//       tax += ((item.product.price * 5) / 100) * item.quantity;
//       deliveryCharges += 45 * item.quantity;
//       totalPrice = productsPrice + tax + deliveryCharges;
//     });
//     res.status(200).json({
//       cart: user.cart,
//       productsPrice: productsPrice,
//       tax: tax,
//       deliveryCharges: deliveryCharges,
//       totalPrice: totalPrice,
//     });
//   } catch (err) {
//     console.log(err);
//   }
// };

exports.postAddtoCart = async (req, res) => {
  const userId = req.userId;
  const productId = new mongoose.Types.ObjectId(req.params.productId);
  try {
    const user = await User.findById(userId);
    let isExist = false;
    let itemIndex;
    if (user) {
      user.cart.forEach((item, index) => {
        if (item.product._id.toString() == productId.toString()) {
          isExist = true;
          itemIndex = index;
          return;
        }
      });
      console.log(isExist);
      if (isExist) {
        user.cart[itemIndex].quantity += 1;
        console.log("exist");
      } else {
        console.log("product not exist");
        user.cart.push({ product: productId, quantity: 1 });
      }
      await user.save();
      res.status(200).json({ msg: "Added To Cart" });
      console.log("product added into cart ");
    } else {
      res.status(400).json({ msg: "Not Found" });
    }
  } catch (err) {
    console.log(err);
  }
};

// exports.getSearchResult = (req, res) => {
//   const keyword = req.query.keyword;
//   console.log(keyword);
//   Product.find({
//     $or: [
//       { title: { $regex: keyword, $options: "i" } },
//       { description: { $regex: keyword, $options: "i" } },
//       { category: { $regex: keyword, $options: "i" } },
//       { subcategory: { $regex: keyword, $options: "i" } },
//       { brand: { $regex: keyword, $options: "i" } },
//     ],
//   })
//     .then((products) => {
//       res.status(200).json({ success: true, products: products });
//     })
//     .catch((err) => {
//       res.status(404).json({ success: false, err: err });
//     });
// };

// exports.deleteFromCart = async (req, res) => {
//   const userId = req.userId;
//   const productId = new mongoose.Types.ObjectId(req.params.productId);
//   try {
//     const user = await User.findById(userId);
//     if (user) {
//       user.cart = user.cart.filter((product) => {
//         return product.product.toString() !== productId.toString();
//       });
//       await user
//         .save()
//         .then((response) => {
//           res.status(200).json({ msg: "deleted From Cart ", cart: user.cart });
//         })
//         .catch((err) => {
//           console.log(err);
//         });
//     } else {
//       res.status(400).json({ msg: "Not Found" });
//     }
//   } catch (err) {
//     console.log(err);
//   }
// };

// exports.putChangeQuantity = async (req, res) => {
//   const user = await User.findById(req.userId);
//   user.cart.forEach((item) => {
//     if (item.product.toString() == req.body.productId) {
//       const qt = parseInt(req.body.qt);
//       console.log(qt);
//       if (qt != 1 && qt != -1) item.quantity = qt;
//       else item.quantity = item.quantity + qt;
//     }
//   });
//   User.findByIdAndUpdate(req.userId, { cart: user.cart })
//     .then((user) => {
//       res.json({ success: "true", result: user });
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };

// exports.getCheckout = async (req, res) => {
//   const userId = req.userId;
//   try {
//     const user = await User.findById(userId).populate("cart.product");
//     const items = [];
//     const productPromises = user.cart.map(async (item) => {
//       const product = await Strip.products.create({
//         name: item.product.title,
//         description: item.product.description[0],
//       });

//       console.log("product id info ");
//       let productprice = parseInt(item.product.price);
//       const id = item.product._id.toString();
//       console.log(id);

//       const price = await Strip.prices.create({
//         product: product.id,
//         metadata: { productId: item.product._id.toString(), orderType: "cart" },
//         unit_amount: parseInt(productprice) * 100,
//         currency: "inr",
//       });

//       items.push({ price: price.id, quantity: item.quantity });
//       console.log(item.product);
//     });
//     const productResult = await Promise.all(productPromises);

//     console.log(items);

//     const session = await Strip.checkout.sessions.create({
//       line_items: items,
//       mode: "payment",
//       payment_method_types: ["card"],
//       success_url: `http://localhost:3000/success`,
//       cancel_url: "http://localhost:3000/fail",
//     });

//     res.json({ url: session.url, session_id: session.id });
//   } catch (err) {
//     console.log(err);
//   }
// };

// exports.getBuy = async (req, res) => {
//   const item = await Product.findById(req.params.productId);
//   if (!item) {
//     return res.json({ msg: "item not found" });
//   }

//   const product = await Strip.products.create({
//     name: item.title,
//     description: item.description[0],
//   });

//   const price = await Strip.prices.create({
//     product: product.id,
//     metadata: { productId: item._id.toString(), orderType: "single" },
//     unit_amount: parseInt(item.price) * 100,
//     currency: "inr",
//   });

//   const session = await Strip.checkout.sessions.create({
//     line_items: [{ price: price.id, quantity: 1 }],
//     mode: "payment",
//     payment_method_types: ["card"],
//     success_url: `http://localhost:3000/success`,
//     cancel_url: "http://localhost:3000/fail",
//   });

//   res.json({ url: session.url, session_id: session.id });
// };

// exports.postOrder = async (req, res) => {
//   const sessionId = req.body.sessionId;
//   const session = await Strip.checkout.sessions.retrieve(sessionId);
//   const items = await Strip.checkout.sessions.listLineItems(sessionId);

//   if (session.status == "complete") {
//     const dateNow = Date.now();
//     const deliveredDate = new Date();
//     deliveredDate.setDate(deliveredDate.getDate() + 4);

//     const date = moment(dateNow).format();
//     let products = [];
//     items.data.forEach((product) => {
//       products.push({
//         product: product.price.metadata.productId,
//         type: product.price.metadata.orderType,
//         quantity:product.quantity,
//         amountTotal:product.amount_total
//       }); 
//     });

//     console.log(products);

//     const isOrdered = await Order.find({ session: sessionId });
//     if (isOrdered.length !== 0) {
//       return res.json({ msg: "already ordered" });
//     } else {
//       const newOrder = new Order({
//         customer: req.userId.toString(),
//         items: products,
//         totalAmount: session.amount_total,
//         orderDate: date,
//         Status: "pending",
//         ShipppingDate: deliveredDate,
//         session: sessionId,
//         paymentStatus: "paid",
//         type: products[0].type,
//       });

//       const result = await newOrder.save();
//       if (result) {
//         res.json({ success: true, result: result });
//       } else {
//         res.json({ success: false, err: "unable to create a order" });
//       }
//     }
//   }
// };

// exports.getOrders = async (req, res) => {
//   const userId = req.userId;
//   const orders = await Order.find({ customer: userId }).populate(
//     "items.product"
//   );
//   const ShippingDates = [];
//   orders.forEach((order) => {
//     if (order.ShipppingDate) {
//       var utcDate = new Date(order.ShipppingDate);
//       var options = {
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//       };
//       var formattedDate = utcDate.toLocaleString("en-US", options);
//       console.log(formattedDate);
//       ShippingDates.push(formattedDate);
//     } else {
//       ShippingDates.push("");
//     }
//   });
//   console.log(ShippingDates);
//   // console.log(orders)
//   if (orders.length == 0) {
//     return res.json({
//       success: true,
//       isOrderEmpty: true,
//       msg: "No Orders Yet",
//     });
//   }
//   res.json({
//     success: true,
//     isOrderEmpty: false,
//     orders: orders,
//     ShippingDates: ShippingDates,
//   });
// };

// exports.getOrder = async (req, res) => {
//   const productId = req.params.productId;
//   try {
//     const order = await Order.findOne({
//       customer: req.userId,
//       "items.product": productId,
//     });
//     if (!order) {
//       return res.status(500).json({ error: "invalid try" });
//     }
//     res.status(200).json({ order: order });
//   } catch (err) {
//     return res.status(500).json({ error: "invalid try" });
//   }
// };

// exports.postReview = async (req, res) => {
//   const productId = req.body.productId;
//   try {
//     const order = await Order.findOne({
//       customer: req.userId,
//       "items.product": productId,
//     });
//     if (order) {
//       try {
//         const review = Review.create({
//           user: req.userId,
//           product: productId,
//           rating: req.body.rating,
//           comment: req.body.review,
//         });
//         res.status(200).json({ msg: "review created successfully" });
//       } catch (err) {
//         res.status(500).json({ err: "internal server error" });
//       }
//     }
//   } catch (err) {
//     res.status(500).json({ err: "internal server error" });
//   }
// };

// exports.getReview = async (req, res) => {
  
//   const productId = req.params.productId;
//   try {
//     let reviews = await Review.find({ product: productId }).populate({
//       path: "user",
//       select: "username",
//     });
//     if (!reviews) {
//       return res.status(500).json({ msg: "internal server error" });
//     }
//     const ratingStats = {
//       total: 0,
//       1: 0,
//       2: 0,
//       3: 0,
//       4: 0,
//       5: 0,
//       percentage: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
//     };

//     reviews.forEach((review) => {
//       const rating = review.rating;
//       ratingStats.total += rating;
//       ratingStats[rating]++;

//       // Calculate percentage for each rating
//       if (rating !== "total") {
//         ratingStats.percentage[rating] =
//           (ratingStats[rating] / reviews.length) * 100;
//       }
//     });

//     // Calculate average
//     ratingStats.average =
//       reviews.length > 0 ? (ratingStats.total / reviews.length).toFixed(2) : 0;
//     console.log(ratingStats)
//     res.status(200).json({ reviews: reviews, ratingStats });
//   } catch (err) {
//     res.status(500).json({ msg: "internal server error" });
//     console.log(err);
//   }
// };


// exports.getOrderInvoice = (req, res) => {
//   const userId = req.userId;
//   const orderId = req.params.orderId;

//   Order.findOne({ _id: orderId, customer: userId }).populate("items.product").then(order => {
//     if (!order) {
//       return res.status(404).json({ error: "Order not found" });
//     }

//     const doc = new pdfKit();

//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `attachment; filename=${orderId + "-" + Date.now()}.pdf`);

//     // Pipe the PDF content directly to the response
//     doc.pipe(res);

//     doc.fontSize(14).text("Invoice Id:- " + orderId);
//     doc.text("Order Date:-" + order.orderDate);
//     doc.text("Shipping Date:-" + order.ShipppingDate);
//     doc.text("Items");
//     doc.text("---------------------------------------");

//     order.items.forEach(product => {
//       doc.text(product.product.title + ":-" + product.amountTotal);
//     });

//     doc.text("---------------------------------------");
//     doc.text("Total Amount:-" + order.totalAmount);

//     // Finalize the PDF and end the response
//     doc.end();
//   }).catch(err => {
//     console.error(err);
//     res.status(500).json({ error: "Internal Server Error" });
//   });
// };