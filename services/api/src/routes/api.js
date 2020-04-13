const router = require("express").Router();

module.exports = router.use(
  "/",
  [require("./game"), require("./player")],
  (err, req, res, next) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
    }
  }
);
