const router = require("express").Router();
const { ObjectID } = require("mongodb");
const mongo = require("../../helpers/mongo");
const cookieParse = require("../../helpers/parseCookie");

const db = () => mongo().then((db) => db.collection("games"));

const fetchGameById = (id) => {
  return db().then((col) => col.findOne({ _id: new ObjectID(id) }));
};

const getGameById = router.get("/details/:id", (req, res, next) => {
  fetchGameById(req.params.id)
    .then((game) => {
      if (game) {
        res.json(game);
      } else {
        res.sendStatus(404);
      }
    })
    .catch(next);
});

const emitGameById = (socket) => {
  const { cookie } = socket.client.request.headers;
  const c = cookieParse(cookie);
  if (c && c["gameID"]) {
    fetchGameById(c["gameID"]).then((game) => {
      if (game) {
        socket.emit("GameData", game);
      }
    });
  }
};

module.exports = getGameById;
module.exports.emitById = emitGameById;
module.exports.fetchGameById = fetchGameById;
