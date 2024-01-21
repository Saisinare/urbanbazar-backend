const express = require("express");
const app = express();
const db = require("./db");
const auth = require("./routes/auth");
const cors = require("cors");
const productRoutes = require("./routes/user/products");
const sellerRoutes = require("./routes/seller/product");
const userRoutes = require("./routes/user/userRoutes");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();
app.use(cookieParser());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://urbanbazar.vercel.app/');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(express.static(path.join(__dirname, "uploaded_img")));

db.connectDb();

app.use(express.json());
app.use(auth);
app.use(productRoutes);

app.use("/seller", sellerRoutes);

app.use(userRoutes);

app.listen(process.env.PORT, () => {
  console.log("server connected");
});
