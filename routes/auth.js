const express = require("express");
const Router = express.Router();
const { body } = require("express-validator");

const authController = require("../controller/authController");

Router.post(
  "/user/signup",
  [
    body("username", "enter a Valid username").notEmpty(),
    body("email", "enter a valid email").notEmpty().isEmail(),
    body("password", "password must be 5 char in length").isLength({ min: 5 })
  ],
  authController.postSignup
);

Router.post(
  "/user/login",
  [
    body("email", "enter a valid email").notEmpty().isEmail(),
    body("password", "password must be 5 char in length").isLength({ min: 5 }),
  ],
  authController.postLogin
);

module.exports = Router;
