const router = require("express").Router();
const mongo = require("../../helpers/mongo");
const ObjectID = require("mongodb").ObjectID;
const moment = require("moment");

const db = () => mongo().then((db) => db.collection("games"));

const initGame = router.post("/new", (req, res, next) => {
  const gameParams = {
    created: moment.utc().toISOString(),
    host: null,
    players: [],
  };
  db()
    .then((col) => col.insertOne(gameParams))
    .then((result) => {
      res.json(gameParams);
    })
    .catch(next);
});

const fetchGameById = (game) =>
  db().then((col) => col.findOne({ _id: new ObjectID(game) }));

const getGame = router.get("/:gameID", (req, res, next) => {
  fetchGameById(req.params.gameID)
    .then((result) => {
      if (result) {
        res.json(result);
      } else {
        res.sendStatus(404);
      }
    })
    .catch(next);
});

const gameHasPlayer = (game, name) => {
  return db()
    .then((col) => col.findOne({ name, _id: new ObjectID(game) }))
    .then((result) => (result ? true : false));
};

const gameAddPlayer = (game, name) => {
  return fetchGameById(game).then((gameData) => {
    if (!gameData.players.includes(name)) {
      const newPlayers = [...gameData.players, name];
      return db().then((col) =>
        col.findOneAndUpdate(
          { _id: new ObjectID(game) },
          { $set: { players: newPlayers } }
        )
      );
    } else {
      return true;
    }
  });
};

const gameRemovePlayer = (game, name) => {
  return fetchGameById(game).then((gameData) => {
    if (gameData.players.includes(name)) {
      const newPlayers = [...gameData.players];
      newPlayers.splice(newPlayers.indexOf(name), 1);

      return db().then((col) =>
        col.findOneAndUpdate(
          { _id: new ObjectID(game) },
          { $set: { players: newPlayers } }
        )
      );
    } else {
      return true;
    }
  });
};

const joinGame = router.post("/join", (req, res, next) => {
  const { gameID, name } = req.body;
  gameAddPlayer(gameID, name)
    .then(() => {
      res.cookie("screenName", name);
      res.cookie("gameID", gameID);
      res.sendStatus(200);
    })
    .catch(next);
});

const leaveGame = router.post("/leave", (req, res, next) => {
  const { gameID, name } = req.body;
  gameRemovePlayer(gameID, name)
    .then(() => {
      res.cookie("screenName", 0, { maxAge: 0 });
      res.cookie("gameID", 0, { maxAge: 0 });
      res.sendStatus(200);
    })
    .catch(next);
});

module.exports = router.use("/game", [initGame, getGame, joinGame, leaveGame]);
