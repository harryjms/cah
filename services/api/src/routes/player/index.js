const router = require("express").Router();
const { fetchGameById } = require("../game/getGame");
const managePlayer = require("./managePlayer");

const postJoinGame = router.post("/join-game", (req, res, next) =>
  managePlayer
    .addPlayerToGame(req.body.name, req.body.game)
    .then((result) => {
      res.cookie("gameID", req.body.game);
      res.cookie("name", req.body.name);
      res.sendStatus(200);
    })
    .catch((err) => {
      if (err.message === "Error: PLAYER_EXISTS") {
        res.statusCode = 409;
        res.json({
          error: "PLAYER_EXISTS",
          message: "The screen name is already in use in this game.",
        });
      } else if (err.message === "Error: GAME_NOT_FOUND") {
        res.statusCode = 404;
        res.json({
          error: "GAME_NOT_FOUND",
          message: "The requested game could not be found.",
        });
      } else {
        next(err);
      }
    })
);

const removeFromGame = router.post("/leave-game", (req, res, next) =>
  managePlayer
    .removePlayerFromGame(req.body.name, req.body.game)
    .then(() => {
      res.sendStatus(200);
    })
    .catch(next)
);

const getPlayersInGame = router.get("/in-game/:game", (req, res, next) => {
  const {
    cookies: { gameID, name },
  } = req;
  fetchGameById(gameID)
    .then((game) => {
      if (game) {
        res.json(game);
      } else {
        res.sendStatus(404);
      }
    })
    .catch(next);
});

module.exports = router.use("/player", [
  postJoinGame,
  removeFromGame,
  getPlayersInGame,
]);
