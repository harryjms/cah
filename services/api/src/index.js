const { config } = require("dotenv");
config({ path: "../../.env" });
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const { parseFromSocket } = require("./helpers/parseCookie");
const { SERVER_PORT } = process.env;
const managePlayer = require("./routes/player/managePlayer");

io.on("connection", (socket) => {
  const player = parseFromSocket(socket);
  socket.player = player;
  console.log(player);
  socket.on("disconnect", () => {
    managePlayer.removePlayerFromGame(player.name, player.gameID).then(() => {
      socket
        .to(player.gameID)
        .emit("NOTIFICATION", `${player.name} left the game.`);
    });
  });
  require("./routes/sockets")(socket);
});

module.exports.socketio = io;

app.use("/api", cookieParser(), bodyParser.json(), require("./routes/api"));

http.listen(SERVER_PORT, () => {
  console.log("Listening on %s...", SERVER_PORT);
});
