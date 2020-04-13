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
  const { cookie } = socket.client.request.headers;
  const c = cookieParse(cookie);
  if (c && c["gameID"]) {
    fetchGameById(c["gameID"]).then((game) => {
      if (game) {
        socket.emit("GameData", game);
      }
    });
  }
};

const getGameDetails = router.get("/details", async (req, res, next) => {
  const { token } = req.cookies;
  try {
    const { gameID, name: screenName, isHost } = jwt.verifyToken(token);
    const { name: gameName, ...gameData } = await fetchGameById(gameID);
    res.json({
      gameID,
      screenName,
      gameName,
      ...gameData,
      isHost: gameData.host === screenName,
    });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.sendStatus(403);
    }
    next(error);
  }
});

module.exports = getGameDetails;
module.exports.emitById = emitGameById;
module.exports.fetchGameById = fetchGameById;
