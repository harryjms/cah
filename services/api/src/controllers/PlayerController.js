const CAHController = require("./CAHController");
const GameController = require("./GameController");

class PlayerController extends CAHController {
  constructor() {
    super();
    this.db = this.mongo().then((db) => db.collection("players"));
  }

  /////////////////////////
  /// Database handlers ///
  /////////////////////////

  findPlayer = (screenName, gameID) => {
    return this.db.then((col) =>
      col.findOne({ game: gameID, name: screenName })
    );
  };

  insertPlayer = (screenName, gameID) => {
    return this.db.then((col) =>
      col.insertOne({ name: screenName, game: gameID })
    );
  };

  removePlayer = (screenName, gameID) => {
    return this.db.then((col) =>
      col.deleteOne({ name: screenName, game: gameID })
    );
  };

  /////////////////
  /// Utilities ///
  /////////////////

  createToken = (gameData, screenName) => {
    return this.jwt.createToken({
      gameID: gameData._id,
      name: screenName,
      isHost: gameData.host === screenName,
    });
  };

  /////////////////////
  /// REST Endpoint ///
  /////////////////////

  getMyDetails = (req, res, next) => {
    try {
      const { player } = req;
      res.json(player);
    } catch (err) {
      next(err);
    }
  };
}

module.exports = PlayerController;
