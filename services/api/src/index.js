const { config } = require("dotenv");
config({ path: "../../.env" });
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const http = require("http").createServer(app);

const io = require("socket.io")(http);
module.exports.socketio = io;

const GameController = require("./controllers/GameController");
const { parseFromSocket } = require("./helpers/parseCookie");
const { SERVER_PORT } = process.env;

io.on("connection", (socket) => {
  const player = parseFromSocket(socket);

  if (player) {
    socket.player = player;
    new GameController().socketListeners(socket);
  }
});

app.use("/api", cookieParser(), bodyParser.json(), require("./routes/api"));

http.listen(SERVER_PORT, () => {
  console.log("Listening on %s...", SERVER_PORT);
});
