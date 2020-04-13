const { config } = require("dotenv");
config({ path: "../../.env" });
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();

const { SERVER_PORT } = process.env;

app.use("/api", cookieParser(), bodyParser.json(), require("./routes/api"));

app.listen(SERVER_PORT, () => {
  console.log("Listening on %s...", SERVER_PORT);
});
