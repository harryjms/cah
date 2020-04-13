const router = require("express").Router();
const mongo = require("../../helpers/mongo");
const moment = require("moment");
const managePlayers = require("../player/managePlayer");
const jwt = require("../../helpers/jwt");

const db = () => mongo().then((db) => db.collection("games"));

const insertGame = (screenName, gameName) => {
  return db().then((coll) =>
    coll.insertOne({
      host: screenName,
      name: gameName,
      created: moment.utc().toISOString(),
      gameState: "IDLE",
      blackCard: {},
      whiteCards: [],
      playedCards: [],
      previousRounds: [],
      selectedWinner: [],
      showBlackCard: false,
    })
  );
};

const postGame = router.post("/new", (req, res, next) => {
  const { screenName, gameName } = req.body;
  insertGame(screenName, gameName)
    .then(({ insertedId }) =>
      managePlayers
        .addPlayerToGame(screenName, insertedId.toString())
        .then(() => {
          const token = jwt.createToken({
            gameID: insertedId.toString(),
            name: screenName,
            isHost: true,
          });
          res.cookie("token", token);
          res.json({
            screenName,
            gameName,
            gameID: insertedId,
            isHost: true,
          });
        })
    )
    .catch(next);
});

module.exports = postGame;
module.exports.insertGame = insertGame;
