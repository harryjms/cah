const router = require("express").Router();
const { ObjectID } = require("mongodb");
const mongo = require("../../helpers/mongo");
const cookieParse = require("../../helpers/parseCookie");
const jwt = require("../../helpers/jwt");

const db = () => mongo().then((db) => db.collection("games"));

const fetchGameById = (id) => {
  return db().then((col) => col.findOne({ _id: new ObjectID(id) }));
};

const getGameById = router.get("/details/:id", (req, res, next) => {
  fetchGameById(req.params.id)
    .then((game) => {
      if (game) {
        res.json(game);
      } else {
        res.sendStatus(404);
      }
    })
    .catch(next);
});

const emitGameById = (socket) => {
  socket.on("GameData", () => {
    const { cookie } = socket.client.request.headers;
    const c = cookieParse(cookie);
    if (c && c["token"]) {
      try {
        const payload = jwt.verifyToken(c["token"]);
        fetchGameById(payload.gameID).then((game) => {
          if (game) {
            const { name, _id: gameID, ...gameData } = game;
            socket.emit("GameData", {
              gameID,
              gameName: name,
              ...gameData,
            });
          }
        });
      } catch (error) {
        throw new Error(error);
      }
    }
  });
};

const joinGameSocket = (socket) => {
  socket.on("JoinGame", () => {
    const { cookie } = socket.client.request.headers;
    const c = cookieParse(cookie);
    if (c && c["token"]) {
      try {
        const payload = jwt.verifyToken(c["token"]);
        fetchGameById(payload.gameID).then((game) => {
          if (game) {
            console.log(`[${payload.name}]: Joined Game ${game._id}.`);
            socket
              .to(game._id)
              .emit("NOTIFICATION", `${payload.name} joined the game.`);
            socket.join(game._id);
          }
        });
      } catch (error) {
        throw new Error(error);
      }
    }
  });
};

const getGameDetails = router.get("/details", async (req, res, next) => {
  const { token } = req.cookies;
  try {
    const { gameID, name: screenName, isHost } = jwt.verifyToken(token);
    const gameData = await fetchGameById(gameID);
    if (gameData) {
      res.json({
        gameID,
        screenName,
        gameName: gameData.name,
        ...gameData,
        isHost: gameData.host === screenName,
      });
    } else {
      const err = new Error();
      err.name = "GAME_NOT_FOUND";
      err.message = "The request game could not be found.";
      throw err;
    }
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.sendStatus(403);
    }
    if (error.name === "GAME_NOT_FOUND") {
      return res.sendStatus(404);
    }
    next(error);
  }
});

module.exports = getGameDetails;
module.exports.emitById = emitGameById;
module.exports.joinGameSocket = joinGameSocket;
module.exports.fetchGameById = fetchGameById;
