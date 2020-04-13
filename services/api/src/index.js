const { config } = require("dotenv");
config({ path: "../../.env" });
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const { SERVER_PORT } = process.env;

io.on("connection", (socket) => {
  const headers = socket.client.request.headers;
  require("./routes/sockets")(socket);
});
module.exports.socketio = io;

app.use("/api", cookieParser(), bodyParser.json(), require("./routes/api"));

http.listen(SERVER_PORT, () => {
  console.log("Listening on %s...", SERVER_PORT);
});
