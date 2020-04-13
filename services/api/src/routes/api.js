const router = require("express").Router();
const socketio = require("../index").socketio;
module.exports = router.use(
  "/",
  [
    require("./game"),
    require("./player"),
    router.get("/test/:game", (req, res, next) => {
      console.log(req.params.game);
      socketio.to(req.params.game).emit("BLACK_CARD_VISIBLE", true);
      res.sendStatus(200);
    }),
  ],
  (err, req, res, next) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
    }
  }
);
