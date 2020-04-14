const CAHController = require("./CAHController");
const PlayerController = require("./PlayerController");
const PackController = require("./PackController");
const moment = require("moment").utc;
const filter = require("lodash/filter");

const randomIndex = (max) => Math.floor(Math.random() * max + 1) - 1;

class GameController extends CAHController {
  constructor() {
    super();
    this.db = () => this.mongo().then((db) => db.collection("games"));
    this.Pack = new PackController();
  }

  ////////////////
  /// Database ///
  ////////////////

  findGame = (id) => {
    return this.db().then((col) => col.findOne({ _id: this.ObjectID(id) }));
  };

  insertGame = (gameName, host, additionalPacks = []) => {
    let packs = ["base", ...additionalPacks];
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
    const { gameName, screenName, additionalPacks: packs } = req.body;
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

      const packExistance = packs.map((pack) => this.Pack.exists(pack));

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
      await this.startGame(gameID);
      this.emitGameUpdate(gameID);
      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  };

  ///////////////////////
  /// Socket Handlers ///
  ///////////////////////

  socketListeners = async (socket) => {
    socket.on("GetGame", async () => {
      const { gameID, name: screenName } = socket.player;

      const game = await this.findGame(gameID);
      socket.join(gameID);

      const Player = new PlayerController();
      await Player.registerSocket(socket.id, screenName, gameID);

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

  emitGameUpdate = async (gameID) => {
    try {
      const game = await this.findGame(gameID);
      this.io.to(gameID).emit("GameData", game);
    } catch (err) {
      throw new Error(err);
    }
  };

  /////////////////
  /// Utilities ///
  /////////////////

  extractUsedCards = (game) => {
    try {
      return game.previousRounds.reduce(
        (aggr, value) => {
          const { blackCards, whiteCards } = value;
          aggr.blackCards = [...aggr.blackCards, ...blackCards];
          aggr.whiteCards = [...aggr.whiteCards, ...whiteCards];
          return aggr;
        },
        { blackCards: [], whiteCards: [] }
      );
    } catch (err) {
      throw err;
    }
  };

  selectBlackCard = async (game, pack) => {
    try {
      //1. Get the possible cards from the pack cache
      if (!pack) {
        pack = await this.Pack.fetchCachedPack(game.packID);

        if (!pack) {
          let err = new Error();
          err.name = "PACK_NOT_CACHED";
          err.message = `The Pack for game ${game._id} could not be found in cache.`;
          throw err;
        }
      }

      const { blackCards: allBlackCards } = pack;
      const { blackCards: usedBlackCards } = this.extractUsedCards(game);
      const availableBlackCards = filter(
        allBlackCards,
        (a) => !usedBlackCards.includes(a)
      );

      return availableBlackCards[randomIndex(availableBlackCards.length)];
    } catch (err) {
      throw err;
    }
  };

  drawInitial10 = (pack, playerCount) => {
    const { whiteCards: allWhiteCards } = pack;
    let remainingWhiteCards = [...allWhiteCards];
    let cards = [];
    for (let i = 0; i < playerCount; i++) {
      let hand = [];
      for (let x = 0; x < 10; x++) {
        const cardIndex = randomIndex(remainingWhiteCards.length);
        hand.push(remainingWhiteCards[cardIndex]);
        remainingWhiteCards.splice(cardIndex, 1);
      }
      cards.push(hand);
    }
    return cards;
  };

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

      let newGameData = {
        packID: null,
        gameState: "SELECTING",
        currentRound: {
          blackCard: {},
          whiteCards: [],
          showBlack: true,
          winner: null,
        },
      };
      // 1. Combine the packs and cache the result
      const combinedPack = this.Pack.compilePacks(game.packs);
      newGameData.packID = await this.Pack.cachePack(combinedPack);

      // 2. Select the first Black Card
      newGameData.currentRound.blackCard = await this.selectBlackCard(
        game,
        combinedPack
      );

      // 3. Generate white cards for every player
      const Player = new PlayerController();
      const players = await (await Player.fetchPlayersInGame(gameID)).toArray();
      const hands = this.drawInitial10(combinedPack, players.length);
      players.forEach((player, i) => {
        this.io.to(player.socketID).emit("WHITE_CARD", hands[i]);
      });

      // 4. Commit to DB and send update to clients
      await this.updateGame(gameID, { ...newGameData });
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
