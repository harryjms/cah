const { MongoClient } = require("mongodb");

const { MONGO_ROOT_USER, MONGO_ROOT_PASS, MONGO_HOST } = process.env;

module.exports = () => {
  return MongoClient.connect(
    `mongodb://${MONGO_ROOT_USER}:${MONGO_ROOT_PASS}@${MONGO_HOST}/?authSource=admin`
  ).then((con) => con.db("cah"));
};
