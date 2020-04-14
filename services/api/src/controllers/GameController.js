const CAHController = require("./CAHController");
const PlayerController = require("./PlayerController");
const PackController = require("./PackController");
const moment = require("moment").utc;

class GameController extends CAHController {
  constructor() {
    super();
    this.db = () => this.mongo().then((db) => db.collection("games"));
    this.ObjectID = (id) => new this.mongo.ObjectID(id);
  }

  ////////////////
  /// Database ///
  ////////////////

  findGame = (id) => {
    return this.db().then((col) => col.findOne({ _id: this.ObjectID(id) }));
  };

  insertGame = (gameName, host, packs = []) => {
    const gameData = {
      host,
      name: gameName,
      created: moment().toISOString(),
      gameState: "IDLE",
      packs,
      currentRound: {
        blackCard: {},
        whiteCards: [],
        showBlack: false,
        winner: null,
      },
      previousRounds: [],
    };
    return this.db()
      .then((coll) => coll.insertOne(gameData))
      .then(({ insertedId }) => ({ ...gameData, _id: insertedId.toString() }));
  };

  updateGame = (gameID, changes) => {
    return this.db().then((col) =>
      col.updateOne({ _id: this.ObjectID(gameID) }, { $set: { ...changes } })
    );
  };

  //////////////////////
  /// REST Endpoints ///
  //////////////////////

  /**
   * POST /api/game
   */
  postNewGame = async (req, res, next) => {
    const { gameName, screenName, packs } = req.body;
    try {
      if (!gameName || !screenName || !Array.isArray(packs)) {
        let err = new Error();
        err.statusCode = 400;
        err.name = "INVALID_START_REQUEST";
        if (!gameName) {
          err.message = "Game name is required";
        } else if (!screenName) {
          err.message = "Screen name is required";
        } else {
          err.message =
            "Packs are either not provided or not in the correct format";
        }
        throw err;
      }

      const Pack = new PackController();
      const packExistance = packs.map((pack) => Pack.exists(pack));

      if (packExistance.includes(false)) {
        let err = new Error();
        const missingPacks = packExistance
          .reduce((aggr, value, key) => {
            if (!value) {
              aggr.push(packs[key]);
            }
            return aggr;
          }, [])
          .join(", ");
        err.name = "PACK_NOT_FOUND";
        err.message =
          "The following packs were requests but cannot be found: " +
          missingPacks +
          ".";
        throw err;
      }

      const Player = new PlayerController();
      const game = await this.insertGame(gameName, screenName, packs);
      const player = await Player.insertPlayer(screenName, game._id);
      if (player) {
        const token = Player.createToken(game, screenName);
        res.cookie("token", token);
        res.json({
          gameID: game._id.toString(),
        });
      }
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/game
   */
  getGame = async (req, res, next) => {
    const { gameID } = req.player;
    try {
      if (gameID) {
        const game = await this.findGame(gameID);
        if (game && Object.keys(game).length > 0) {
          return res.json(game);
        }
      }
      let err = new Error();
      err.statusCode = 404;
      err.name = "GAME_NOT_FOUND";
      err.message = "The game could not be found";
      throw err;
    } catch (err) {
      next(err);
    }
  };

  /**
   * POST /api/game/join
   */
  postJoinGame = async (req, res, next) => {
    const { gameID, screenName } = req.body;
    try {
      const Player = new PlayerController();
      const game = await this.findGame(gameID);
      if (!game) {
        let err = new Error();
        err.statusCode = 404;
        err.name = "GAME_NOT_FOUND";
        err.message = "The game could not be found";
        throw err;
      }

      const player = await Player.findPlayer(screenName, gameID);
      if (player) {
        let err = new Error();
        err.statusCode = 409;
        err.name = "PLAYER_EXISTS";
        err.message = "The screen name is already in use";
        throw err;
      }

      await Player.insertPlayer(screenName, gameID);
      const token = Player.createToken(game, screenName);
      this.emitPlayerJoined(screenName, gameID);
      res.cookie("token", token);
      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  };

  /**
   * POST /api/game/leave
   */
  postLeaveGame = async (req, res, next) => {
    const {
      player: { gameID, name },
    } = req;

    const Player = new PlayerController();
    try {
      await Player.removePlayer(name, gameID);
      this.emitPlayerLeft(name, gameID);
      res.cookie("token", 0, { maxAge: 0 });
      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  };

  /**
   * PUT /api/game/start
   */
  putStartGame = async (req, res, next) => {
    const {
      player: { gameID, isHost },
    } = req;
    try {
      if (!isHost) {
        let err = new Error();
        err.statusCode = 403;
        err.name = "NOT_HOST";
        err.message =
          "You are not able to start the game as you are not the host.";
        throw err;
      }
    } catch (err) {
      next(err);
    }
  };

  ///////////////////////
  /// Socket Handlers ///
  ///////////////////////

  socketListeners = (socket) => {
    socket.on("GetGame", async () => {
      const { gameID } = socket.player;
      const game = await this.findGame(gameID);
      socket.emit("GameData", game);
    });
  };

  emitPlayerLeft = (screenName, gameID) => {
    this.logInfo(`[${screenName}]: Left the game ${gameID}`);
    this.io.to(gameID).emit("NOTIFICATION", `${screenName} has left the game`);
  };

  emitPlayerJoined = (screenName, gameID) => {
    this.logInfo(`[${screenName}]: Joined the game ${gameID}`);
    this.io
      .to(gameID)
      .emit("NOTIFICATION", `${screenName} has joined the game`);
  };

  /////////////////
  /// Utilities ///
  /////////////////

  startGame = async (gameID) => {
    try {
      const game = await this.findGame(gameID);
      if (!game) {
        let err = new Error();
        err.statusCode = 404;
        err.name = "GAME_NOT_FOUND";
        err.message`Unable to find game ${gameID}`;
        throw err;
      }

      // 1.
    } catch (err) {
      if (typeof err === "Error") {
        throw err;
      } else {
        throw new Error(err);
      }
    }
  };
}

module.exports = GameController;
