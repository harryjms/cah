const router = require("express").Router();
const jwt = require("../helpers/jwt");
const GameController = require("../controllers/GameController");

const handleError = (err, req, res, next) => {
  if (err) {
    console.log(err);
    res.statusCode = err.statusCode || 500;
    res.send(err);
  }
};

const parseToken = (req, res, next) => {
  try {
    req.player = jwt.payloadFromCookie(req.cookies);
    if (req.player) {
      next();
    } else {
      res.sendStatus(200);
    }
  } catch (err) {
    next(err);
  }
};

module.exports = router.use(
  "/",
  router
    .get("/game/:gameID?", new GameController().getGame)
    .post("/game", new GameController().postNewGame)
    .post("/game/join", new GameController().postJoinGame)
    .post("/game/leave", parseToken, new GameController().postLeaveGame),
  handleError
);
