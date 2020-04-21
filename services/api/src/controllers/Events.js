const EventEmitter = require("events");

class GameEmitter extends EventEmitter {}
class PlayerEmitter extends EventEmitter {}

module.exports.Events = {
  Game: {
    INSERT: "GAME:INSERT",
    UPDATE: "GAME:UPDATE",
    JOIN: "GAME:JOIN",
    LEAVE: "GAME:LEAVE",
  },
  Player: {
    INSERT: "PLAYER:INSERT",
    UPDATE: "PLAYER:UPDATE",
  },
};

module.exports.GameEvents = new GameEmitter();
module.exports.PlayerEvents = new PlayerEmitter();
