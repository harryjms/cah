const router = require("express").Router();

module.exports = router.use("/game", [
  require("./newGame"),
  require("./getGame"),
]);
