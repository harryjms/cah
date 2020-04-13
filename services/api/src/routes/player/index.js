const router = require("express").Router();
const { fetchGameById } = require("../game/getGame");
const managePlayer = require("./managePlayer");

const postJoinGame = router.post("/join-game", (req, res, next) =>
  managePlayer
    .addPlayerToGame(req.body.name, req.body.game)
    .then((result) => {
      if (result) {
        if (result === "GAME_NOT_FOUND") {
          res.statusCode = 404;
          res.json({
            error: "GAME_NOT_FOUND",
            message: "The requested game could not be found.",
          });
        } else if (result !== "PLAYER_EXISTS") {
          res.cookie("gameID", result.game);
          res.cookie("name", result.name);
          res.sendStatus(200);
        } else {
          res.statusCode = 409;
          res.json({
            error: "PLAYER_EXISTS",
            message: "The screen name is already in use in this game.",
          });
        }
      } else {
        res.sendStatus(404);
      }
    })
    .catch(next)
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
