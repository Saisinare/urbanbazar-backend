const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const JWT_SECRETE = process.env.JWT_SCERETE;
const fetchuser = (req, res, next) => {
  const token = req.query.token;
  if (!token) {
    return res
      .status(401)
      .json({
        message: "enter Valid Token",
        JWT: JWT_SECRETE,
      });
  }
  const data = jwt.verify(token, JWT_SECRETE);
  req.userId = data.id;
  next();
};

module.exports = fetchuser;
