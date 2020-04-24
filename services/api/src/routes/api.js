const router = require("express").Router();
const jwt = require("../helpers/jwt");
const GameController = require("../controllers/GameController");
const PlayerController = require("../controllers/PlayerController");
const PackController = require("../controllers/PackController");
const InviteController = require("../controllers/InviteController");
const log = require("log-to-file");
const path = require("path");

const handleError = (err, req, res, next) => {
  if (err) {
    console.log(err);
    log(err, path.resolve("/opt/cah/api/error.log"));
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

const Pack = new PackController();
const Player = new PlayerController();
const Game = new GameController();
const Invite = new InviteController();

module.exports = router.use(
  "/",
  router
    .get("/packs", Pack.getPacks)
    .get("/me", parseToken, Player.getMyDetails)
    .post("/game", Game.postNewGame)
    .post("/game/join", Game.postJoinGame)
    .put("/game/start", parseToken, Game.putStartGame)
    .post("/game/cards", parseToken, Game.postCardSelection)
    .post("/game/winner", parseToken, Game.postSelectWinner)
    .get("/game/end", parseToken, Game.postEndGame)
    .get("/invite/:code", Invite.getCheckInite),
  handleError
);
