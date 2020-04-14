const router = require("express").Router();
const jwt = require("../helpers/jwt");
const GameController = require("../controllers/GameController");
const PlayerController = require("../controllers/PlayerController");
const PackController = require("../controllers/PackController");

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
      res.sendStatus(403);
    }
  } catch (err) {
    next(err);
  }
};

module.exports = router.use(
  "/",
  router
    .get("/packs", new PackController().getPacks)
    .get("/me", parseToken, new PlayerController().getMyDetails)
    .post("/game", new GameController().postNewGame)
    .post("/game/join", new GameController().postJoinGame)
    .put("/game/start", parseToken, new GameController().putStartGame),
  handleError
);
