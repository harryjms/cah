const getGame = require("./game/getGame");
const managePlayer = require("./player/managePlayer");
module.exports = (socket) => [
  getGame.emitById(socket),
  getGame.joinGameSocket(socket),
];
