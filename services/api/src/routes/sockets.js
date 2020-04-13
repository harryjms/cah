const getGame = require("./game/getGame");
module.exports = (socket) => [
  getGame.emitById(socket),
  getGame.joinGameSocket(socket),
];
