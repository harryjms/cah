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

const joinGame = router.post("/join", (req, res, next) => {
  const { gameID, name } = req.body;
  gameHasPlayer().then((result) => {
    if (result) {
      res.sendStatus(200);
    } else {
      fetchGameById(gameID).then((game) => {
        const newPlayers = [...game.players];
        newPlayers.push(name);
        res.sendStatus(200);
      });
    }
  });
});

module.exports = router.use("/game", [initGame, getGame]);
