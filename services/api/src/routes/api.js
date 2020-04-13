const router = require("express").Router();

module.exports = router.use("/", [require("./game"), require("./player")]);
