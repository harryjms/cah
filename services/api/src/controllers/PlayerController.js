const CAHController = require("./CAHController");
const GameController = require("./GameController");
const Events = require("./Events").Events;
const findIndex = require("lodash/findIndex");
const filter = require("lodash/filter");
const moment = require("moment").utc;
const randomIndex = (max) => Math.floor(Math.random() * max + 1) - 1;

class PlayerController extends CAHController {
  constructor() {
    super();
    this.db = this.mongo().then((db) => db.collection("players"));

    this.GameEvents.on(Events.Game.INSERT, (game) => {
      console.log(`[${game._id}] created`);
    });
  }

  /////////////////////////
  /// Database handlers ///
  /////////////////////////

  findPlayer = (screenName, gameID) => {
    return this.db.then((col) =>
      col.findOne({ game: gameID, name: screenName })
    );
  };

  findPlayerByCardSelection = (gameID, selected) => {
    return this.db.then((col) => col.findOne({ game: gameID, selected }));
  };

  insertPlayer = (screenName, gameID, state = "IDLE") => {
    return this.db.then((col) =>
      col.insertOne({
        name: screenName,
        game: gameID,
        socketID: null,
        joined: moment().toISOString(),
        state,
        hand: [],
        selected: [],
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

  updatePlayersInGame = (gameID, changes, where) =>
    this.db.then((col) =>
      col.updateMany({ game: gameID, ...where }, { $set: { ...changes } })
    );

  fetchPlayersInGame = (gameID) => {
    return this.db
      .then((col) => col.find({ game: gameID, socketID: { $ne: null } }))
      .then((players) => players.toArray());
  };

  //////////////
  /// Socket ///
  //////////////
  emitUpdateAll = async (gameID) => {
    try {
      const players = await this.fetchPlayersInGame(gameID);
      players.forEach((player) => {
        this.io.to(player.socketID).emit("PlayerData", player);
      });
    } catch (err) {
      throw err;
    }
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
      const player = await this.findPlayer(screenName, gameID);
      if (player) {
        if (player.state === "CZAR") {
          await this.selectNextCzar(gameID);
        }
      }
      await this.updatePlayer(screenName, gameID, {
        socketID: null,
        selection: [],
      });
      this.emitUpdateAll(gameID);
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

  updateCardSelection = async (screenName, gameID, selection) => {
    try {
      const player = await this.findPlayer(screenName, gameID);
      if (!player) {
        let err = new Error();
        err.statusCode = 400;
        err.name = "PLAYER_INVALID";
        err.message = "The player screen name does not match any in the game.";
        throw err;
      }

      const hand = player.hand;
      selection.forEach((card) => {
        if (!hand.includes(card)) {
          let err = new Error();
          err.statusCode = 400;
          err.name = "SELECTED_CARD_NOT_IN_HAND";
          err.message =
            "One or more of the cards selected are not the players hand";
          throw err;
        }
      });

      const newHand = [...hand].filter((a) => !selection.includes(a));

      await this.updatePlayer(screenName, gameID, {
        hand: newHand,
        selected: selection,
      });

      this.io
        .to(player.socketID)
        .emit("PlayerData", { ...player, hand: newHand, selected: selection });
      return true;
    } catch (err) {
      throw err;
    }
  };

  selectNextCzar = async (gameID) => {
    try {
      const players = filter(
        await this.fetchPlayersInGame(gameID),
        (p) => p.state !== "CZAR"
      );

      let nextIndex = randomIndex(players.length);

      if (nextIndex > players.length - 1) {
        nextIndex = 0;
      }

      await this.updatePlayersInGame(gameID, { state: "IDLE" });
      await this.updatePlayer(players[nextIndex].name, gameID, {
        state: "CZAR",
      });

      return players[nextIndex];
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
