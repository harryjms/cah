const router = require("express").Router();
const mongo = require("../../helpers/mongo");
const { ObjectID } = require("mongodb");
const db = () => mongo().then((db) => db.collection("players"));
const moment = require("moment");

const fetchPlayersInGame = (game) => db().then((col) => col.find({ game }));

const addPlayerToGame = (name, game) =>
  db().then((col) =>
    col.findOne({ game, name }).then((result) => {
      if (!result) {
        return col.insertOne({
          game,
          name,
          joined: moment.utc().toISOString(),
        });
      } else {
        return result;
      }
    })
  );

const removePlayerFromGame = (name, game) =>
  db().then((col) => col.deleteOne({ game, name }));

module.exports.fetchPlayersInGame = fetchPlayersInGame;
module.exports.addPlayerToGame = addPlayerToGame;
module.exports.removePlayerFromGame = removePlayerFromGame;
