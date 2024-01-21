const mongoose = require("mongoose");

const connectDb = async () => {
  const db = await mongoose.connect(process.env.DBURI);
  if (db) {
    console.log("db connected");
  } else {
    console.log("some error occure");
  }
};

module.exports = { connectDb };
