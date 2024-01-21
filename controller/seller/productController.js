const Product = require("../../models/Product");
const Order = require("../../models/Order");
const mongoose = require("mongoose");

exports.getProducts = async (req, res) => {
  const userId = req.userId;

  try {
    const products = await Product.find({ seller: userId });
    if (products) {
      res.status(200).json({ products: products });
    } else {
      res.status(400).json({ err: "unable to get products " });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.getProduct = async (req, res) => {
  const { productId } = req.params;
  try {
    const product = await Product.findById(productId);
    if (product.seller != req.userId) {
      return res.status(402).json({ err: "Unauthorized access" });
    }
    if (product) {
      res.status(200).json({ product: product });
    } else {
      res.status(400).json({ err: "unable to get product " });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.postProduct = async (req, res) => {
  const userId = req.userId;
  const image = req.file.filename;
  const product = new Product({
    title: req.body.title,
    description: req.body.description,
    image: image,
    price: req.body.price,
    category: req.body.category,
    subcategory: req.body.subcategory,
    seller: userId,
    brand: req.body.brand,
    product_quantity: req.body.product_quantity,
  });

  try {
    const result = await product.save();
    if (result) {
      res
        .status(200)
        .json({ msg: "Product Inserted SuccessFully", product: result });
    } else {
      res.status(400).json({ err: "Product Not Inserted SuccessFully" });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.putProduct = async (req, res) => {
  const productId = req.params.productId;
  const updatedProduct = {};

  if (req.body.title) updatedProduct.title = req.body.title;
  if (req.body.description) updatedProduct.description = req.body.description;
  if (req.body.price) updatedProduct.price = req.body.price;
  if (req.body.image) updatedProduct.image = req.body.image;
  if (req.body.category) updatedProduct.category = req.body.category;
  if (req.body.subcategory) updatedProduct.subcategory = req.body.subcategory;
  if (req.body.brand) updatedProduct.brand = req.body.brand;
  if (req.body.product_quantity)
    updatedProduct.product_quantity = req.body.product_quantity;

  try {
    const product = await Product.findByIdAndUpdate(productId, updatedProduct);
    if (product) {
      if (product.seller != req.userId) {
        return res.status(402).json({ err: "unauthorized access" });
      }
      res
        .status(200)
        .json({ msg: "product updated successfully", product: product });
    } else {
      res.status(400).json({ err: "unable to update Product" });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.deleteProduct = async (req, res) => {
  const productId = req.params.productId;
  const userId = req.userId;
  try {
    const product = await Product.findOneAndDelete({
      _id: productId,
      seller: userId,
    });
    if (product) {
      res.status(200).json({ msg: "product delete successfully" });
    } else {
      res.status(400).json({ msg: "product delete Failed" });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.getStatistics = async (req, res) => {
  let totalRevenue = 0;

  mongoose
    .connect(process.env.DBURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      return Order.aggregate([
        { $unwind: "$items" },
        {
          $lookup: {
            from: "products",
            localField: "items.product",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        { $unwind: "$productDetails" },
        {
          $match: {
            "productDetails.seller": new mongoose.Types.ObjectId(req.userId),
          },
        },
        {
          $group: {
            _id: "$productDetails._id",
            totalRevenue: { $sum: "$items.amountTotal" },
            uniqueCustomers: { $addToSet: "$customer" },
          },
        },
      ]);
    })
    .then(async (result) => {
      totalRevenue = result.reduce((sum, item) => {
        const revenue = parseFloat(item.totalRevenue);
        return isNaN(revenue) ? sum : sum + revenue;
      }, 0);

      const sellerProducts = await Product.find({
        seller: req.userId,
      }).distinct("_id");

      const uniqueCustomers = await Order.distinct("customer", {
        "items.product": { $in: sellerProducts },
      });

      const totalCustomers = uniqueCustomers.length;

      res.json({
        msg: "success",
        totalRevenue: totalRevenue,
        ordersCount: result.length,
        totalCustomers: totalCustomers,
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ msg: "error" });
    })
};

exports.getRevenueStatistics = async (req, res) => {
  try {
    const sellerProducts = await Product.find({ seller: req.userId }).distinct(
      "_id"
    );
    const userProvidedYear = req.params.year;

    const yearlyMonthlyRevenue = await Order.aggregate([
      {
        $match: {
          "items.product": { $in: sellerProducts },
          orderDate: { $exists: true }, // Ensure orderDate exists
          $expr: { $eq: [{ $year: "$orderDate" }, parseInt(userProvidedYear)] }, // Match the specified year
        },
      },
      {
        $project: {
          month: { $month: "$orderDate" },
          totalRevenue: { $sum: "$items.amountTotal" },
        },
      },
      {
        $group: {
          _id: "$month",
          totalRevenue: { $sum: "$totalRevenue" },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          totalRevenue: 1,
        },
      },
      {
        $sort: { month: 1 }, // Optional: Sort by month
      },
    ]);

    console.log(
      `Monthly Revenue for ${userProvidedYear}:`,
      yearlyMonthlyRevenue
    );

    res.json({ msg: "success", yearlyMonthlyRevenue: yearlyMonthlyRevenue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "error" });
  }
};
