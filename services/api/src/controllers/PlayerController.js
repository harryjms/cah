const CAHController = require("./CAHController");
const GameController = require("./GameController");

const moment = require("moment").utc;

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

  insertPlayer = (screenName, gameID, state) => {
    return this.db.then((col) =>
      col.insertOne({
        name: screenName,
        game: gameID,
        socketID: null,
        joined: moment().toISOString(),
        state,
        hand: [],
      })
    );
  };

  removePlayer = (screenName, gameID) => {
    return this.db.then((col) =>
      col.deleteOne({ name: screenName, game: gameID })
    );
  };

  updatePlayer = (screenName, gameID, updates) => {
    return this.db.then((col) =>
      col.findOneAndUpdate(
        { name: screenName, game: gameID },
        { $set: { ...updates } }
      )
    );
  };

  fetchPlayersInGame = (gameID) => {
    return this.db.then((col) => col.find({ game: gameID }));
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

  registerSocket = (socketID, screenName, gameID) => {
    try {
      return this.updatePlayer(screenName, gameID, { socketID });
    } catch (err) {
      throw err;
    }
  };

  leaveGame = async (screenName, gameID) => {
    try {
      return await this.updatePlayer(screenName, gameID, { socketID: null });
    } catch (err) {
      throw err;
    }
  };

  updateHand = async (screenName, gameID, hand) => {
    try {
      const player = await this.updatePlayer(screenName, gameID, { hand });

      this.io
        .to(player.value.socketID)
        .emit("PlayerData", { ...player.value, hand });
    } catch (err) {
      throw err;
    }
  };

  /////////////////////
  /// REST Endpoint ///
  /////////////////////

  getMyDetails = async (req, res, next) => {
    try {
      const { player } = req;
      res.json(await this.findPlayer(player.name, player.gameID));
    } catch (err) {
      next(err);
    }
  };
}

module.exports = PlayerController;
