const User = require("../models/User");
const { validationResult } = require("express-validator");
const bycrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv")
dotenv.config()
const JWT_SECRETE = process.env.JWT_SCERETE;

exports.postSignup = async (req, res) => {
    try {
      const isUserExist = await User.findOne({ username: req.body.username });
      
      if (isUserExist != null) {
        return res.status(405).json({ msg: "Username Already Exist" });
      }

      const isEmailLink = await User.findOne({ email: req.body.email });
      if (isEmailLink != null) {
        return res
          .status(405)
          .json({ msg: "Email Already Link with Another Account" });
      }

      const isMobileLink = await User.findOne({ mobileNo: req.body.mobileNo });
      if (isMobileLink != null) {
        return res
          .status(405)
          .json({ msg: "Mobile No. Already Link with Another Account" });
      }

    } catch (err) {
      console.log(err);
    }
    const hashedPassword = await bycrypt.hash(req.body.password, 10);
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      mobileNo: req.body.mobileNo,
      password: hashedPassword,
      isSeller:false,
      cart:[]
    });
    const data = {
      id: user._id,
    };

    const authtoken = jwt.sign(data, JWT_SECRETE);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ errors: errors, success: false });
    }
    const userWithoutpass = user
    delete userWithoutpass.password 
    user
      .save()
      .then((user) => {
        res.cookie(`token`,authtoken);
        res.json({
          sucess: true,
          message: "Sign up SuccessFull",
          user: userWithoutpass,
          token: authtoken,
        });
      })
      .catch((err) => {
        res.json({
          success: false,
          message: "please enter valid username",
          err: err,
        });
      });
  }


  exports.postLogin = (req, res) => {
    const { email } = req.body;
    const { password } = req.body;
  
    User.findOne({ email: email }).populate('cart').then((user) => {
      if (user) {
        const hashpassword = user.password;
        bycrypt
          .compare(password, hashpassword)
          .then((result) => {
            if (result) {
              const data = {
                id: user._id,
              };
              const authtoken = jwt.sign(data, JWT_SECRETE);
              res.cookie('token',authtoken)
              const userWithoutPass = user.toObject()
              delete userWithoutPass["password"]
              console.log(userWithoutPass)
              
              return res.cookie("authtoken",authtoken).json({
                success: true,
                message: "user login successFully",
                user:userWithoutPass,
                authtoken: authtoken,
              });
            } else {
              return res.json({
                success: false,
              });
            }
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        return res.json({ success: false, message: "User Not Found " });
      }
    });
  }