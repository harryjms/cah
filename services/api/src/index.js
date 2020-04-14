const { config } = require("dotenv");
config({ path: "../../.env" });
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const http = require("http").createServer(app);

const io = require("socket.io")(http);
module.exports.socketio = io;

const { parseFromSocket } = require("./helpers/parseCookie");
const { SERVER_PORT } = process.env;
const managePlayer = require("./routes/player/managePlayer");

io.on("connection", (socket) => {
  const player = parseFromSocket(socket);
  socket.player = player || {};
  socket.on("disconnect", () => {
    managePlayer.removePlayerFromGame(player.name, player.gameID);
  });
  require("./routes/sockets")(socket);
});

app.use("/api", cookieParser(), bodyParser.json(), require("./routes/api"));

http.listen(SERVER_PORT, () => {
  console.log("Listening on %s...", SERVER_PORT);
});
