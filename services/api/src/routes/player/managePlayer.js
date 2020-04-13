const router = require("express").Router();
const mongo = require("../../helpers/mongo");
const db = () => mongo().then((db) => db.collection("players"));
const { fetchGameById } = require("../game/getGame");
const { parseFromSocket } = require("../../helpers/parseCookie");

const { socketio } = require("../../index");

const fetchPlayersInGame = (game) => db().then((col) => col.find({ game }));

const addPlayerToGame = async (name, game) => {
  try {
    // check the Game ID exists
    const gameData = await fetchGameById(game);

    if (gameData) {
      // check if the screen name is in use
      const player = await db().then((col) =>
        col.find({ game, name }).toArray()
      );

      if (player.length > 0) {
        throw new Error("PLAYER_EXISTS");
      } else {
        return db().then((col) => col.insertOne({ game, name, cards: [] }));
      }
    } else {
      throw new Error("GAME_NOT_FOUND");
    }
  } catch (err) {
    throw new Error(err);
  }
};

const removePlayerFromGame = (name, game) => {
  return db().then((col) => col.deleteOne({ game, name }));
};

module.exports.fetchPlayersInGame = fetchPlayersInGame;
module.exports.addPlayerToGame = addPlayerToGame;
module.exports.removePlayerFromGame = removePlayerFromGame;
