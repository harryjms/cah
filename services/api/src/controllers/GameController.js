const CAHController = require("./CAHController");
const PlayerController = require("./PlayerController");
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

  insertGame = (gameName, host) => {
    const gameData = {
      host,
      name: gameName,
      created: moment().toISOString(),
      gameState: "IDLE",
      pack: {},
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
    const { gameName, screenName } = req.body;
    try {
      const Player = new PlayerController();
      const game = await this.insertGame(gameName, screenName);
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
    const { gameID } = req.params;
    try {
      console.log(gameID);
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

  ///////////////////////
  /// Socket Handlers ///
  ///////////////////////

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
}

module.exports = GameController;
