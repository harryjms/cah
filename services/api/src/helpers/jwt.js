const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

module.exports.createToken = (value) => jwt.sign(value, JWT_SECRET);
module.exports.verifyToken = (token) => jwt.verify(token, JWT_SECRET);
