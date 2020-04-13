const router = require("express").Router();
const mongo = require("../../helpers/mongo");
const { v4: uuid } = require("uuid");
const moment = require("moment");

const db = () => mongo().then((db) => db.collection("players"));

const newPlayer = router.post("/new", (req, res, next) => {
  const { name } = req.body;
  if (!name) {
    return res.sendStatus(400);
  }

  const playerParams = {
    name,
    joined: moment.utc().toISOString(),
    lastActive: moment.utc().toISOString(),
  };

  db().then((col) => {
    col.findOne({ name }).then((result) => {
      if (!result) {
        return col.insertOne(playerParams).then((result) => {
          res.json(playerParams);
        });
      } else if (
        moment(result.lastActive).isSameOrBefore(moment().subtract(1, "day"))
      ) {
        return col.remove({ name }).then(() => {
          return col.insertOne(playerParams).then((result) => {
            res.json(playerParams);
          });
        });
      } else {
        res.sendStatus(409);
      }
    });
  });
});

module.exports = router.use("/player", [newPlayer]);
