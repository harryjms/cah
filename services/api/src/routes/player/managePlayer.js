const router = require("express").Router();
const mongo = require("../../helpers/mongo");
const { ObjectID } = require("mongodb");
const db = () => mongo().then((db) => db.collection("players"));
const moment = require("moment");

const fetchPlayersInGame = (game) => db().then((col) => col.find({ game }));

const addPlayerToGame = (name, game) =>
  db().then((col) =>
    fetchPlayersInGame(game).then((g) => {
      if (!g) {
        return "GAME_NOT_FOUND";
      }
      return col.findOne({ game, name }).then((result) => {
        if (!result) {
          return col.insertOne({
            game,
            name,
            joined: moment.utc().toISOString(),
          });
        } else {
          return "PLAYER_EXISTS";
        }
      });
    })
  );

const removePlayerFromGame = (name, game) =>
  db().then((col) => col.deleteOne({ game, name }));

module.exports.fetchPlayersInGame = fetchPlayersInGame;
module.exports.addPlayerToGame = addPlayerToGame;
module.exports.removePlayerFromGame = removePlayerFromGame;
