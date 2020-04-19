const CAHController = require("./CAHController");
const PlayerController = require("./PlayerController");
const PackController = require("./PackController");
const moment = require("moment").utc;
const filter = require("lodash/filter");
const findIndex = require("lodash/findIndex");
const reduce = require("lodash/reduce");
const flattenDeep = require("lodash/flattenDeep");

const randomIndex = (max) => Math.floor(Math.random() * max + 1) - 1;

class GameController extends CAHController {
  constructor() {
    super();
    this.db = () => this.mongo().then((db) => db.collection("games"));
    this.Pack = new PackController();
    this.Player = new PlayerController();
  }

  ////////////////
  /// Database ///
  ////////////////

  findGame = (id) => {
    return this.db().then((col) => col.findOne({ _id: this.ObjectID(id) }));
  };

  insertGame = (gameName, host, additionalPacks = []) => {
    let packs = ["baseUK", ...additionalPacks];
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
        showWhite: false,
        winner: {
          screenName: null,
          hand: [],
        },
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

  fetchGameWinners = (gameID) => {
    return this.db()
      .then((col) =>
        col.aggregate([
          {
            $match: {
              _id: this.ObjectID(gameID),
            },
          },
          {
            $project: {
              _id: 1.0,
              winners: {
                $reduce: {
                  input: "$previousRounds.winner",
                  initialValue: [],
                  in: {
                    $concatArrays: ["$$value", ["$$this.screenName"]],
                  },
                },
              },
            },
          },
          {
            $unwind: {
              path: "$winners",
            },
          },
          {
            $group: {
              _id: "$winners",
              count: {
                $sum: 1.0,
              },
            },
          },
          {
            $sort: {
              count: -1.0,
            },
          },
          {
            $project: {
              _id: 0.0,
              screenName: "$_id",
              roundsWon: "$count",
            },
          },
        ])
      )
      .then((results) => results.toArray());
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

      const game = await this.insertGame(gameName, screenName, packs);
      const player = await this.Player.insertPlayer(
        screenName,
        game._id,
        "CZAR"
      );
      if (player) {
        const token = this.Player.createToken(game, screenName);
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

      if (game.gameState !== "IDLE") {
        let err = new Error();
        err.statusCode = 423;
        err.name = "GAME_IN_PROGRESS";
        err.message =
          "Sorry, you are not able to join this game as it has already begun.";
        throw err;
      }

      const player = await this.Player.findPlayer(screenName, gameID);
      if (player) {
        let err = new Error();
        err.statusCode = 409;
        err.name = "PLAYER_EXISTS";
        err.message = "The screen name is already in use";
        throw err;
      }

      await this.Player.insertPlayer(screenName, gameID, "IDLE");
      const token = this.Player.createToken(game, screenName);
      this.emitPlayerJoined(screenName, gameID);
      res.cookie("token", token);
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

  /**
   * POST /api/game/cards
   */
  postCardSelection = async (req, res, next) => {
    try {
      const { gameID, name: screenName } = req.player;
      const { handSelection } = req.body;

      // Update the cards in the players hand
      await this.Player.updateCardSelection(screenName, gameID, handSelection);

      // Get white cards in game & game data
      const cards = await this.Pack.fetchSelectedWhiteCards(gameID);
      const game = await this.findGame(gameID);

      // Put the cards into the game
      await this.updateGame(gameID, {
        currentRound: { ...game.currentRound, whiteCards: cards },
      });

      // Update the player, marking them as having selected their cards
      await this.Player.updatePlayer(screenName, gameID, { state: "SELECTED" });

      // Send out updated game data
      this.emitGameUpdate(gameID);

      // Send out updated player states
      this.Player.emitUpdateAll(gameID);

      // Check if game state can progress
      await this.gameProgressManager(gameID);

      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  };

  /**
   * POST /api/game/winner
   */
  postSelectWinner = async (req, res, next) => {
    try {
      const {
        player: { name, gameID },
        body: { hand },
      } = req;

      const game = await this.findGame(gameID);
      const player = await this.Player.findPlayer(name, gameID);

      if (player.state !== "CZAR") {
        let err = new Error();
        err.statusCode = 403;
        err.name = "NOT_CZAR";
        err.message =
          "You are not able to select the winning hand as you are not the Czar.";
        throw err;
      }

      const winningPlayer = await this.Player.findPlayerByCardSelection(
        gameID,
        hand
      );

      await this.setGameWinner(gameID, {
        screenName: winningPlayer.name,
        hand,
      });

      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  };

  postEndGame = async (req, res, next) => {
    try {
      const {
        player: { gameID, isHost },
      } = req;
      if (!isHost) {
        let err = new Error();
        err.statusCode = 403;
        err.name = "CANNOT_END_GAME";
        err.message = "You are not the host so cannt end the game";
        throw err;
      }
      await this.endGame(gameID);
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

      await this.Player.registerSocket(socket.id, screenName, gameID);
      this.emitPlayerJoined(screenName, gameID);
      socket.emit("GameData", game);
    });

    socket.on("disconnect", async () => {
      const { name, gameID } = socket.player;
      try {
        await this.Player.leaveGame(name, gameID);
        this.emitPlayerLeft(name, gameID);
      } catch (err) {
        next(err);
      }
    });
  };

  emitPlayerLeft = (screenName, gameID) => {
    this.logDev(`[${screenName}]: Left the game ${gameID}`);
    this.io.to(gameID).emit("Notification", `${screenName} has left the game`);
    this.emitPlayersInGame(gameID);
  };

  emitPlayerJoined = (screenName, gameID) => {
    this.logDev(`[${screenName}]: Joined the game ${gameID}`);
    this.io
      .to(gameID)
      .emit("Notification", `${screenName} has joined the game`);
    this.emitPlayersInGame(gameID);
  };

  emitGameUpdate = async (gameID) => {
    try {
      const game = await this.findGame(gameID);
      this.io.to(gameID).emit("GameData", game);
      this.emitPlayersInGame(gameID);
    } catch (err) {
      throw err;
    }
  };

  emitPlayersInGame = async (gameID) => {
    try {
      const players = await this.Player.fetchPlayersInGame(
        gameID
      ).then((players) =>
        players.map((player) => ({ name: player.name, state: player.state }))
      );
      this.io.to(gameID).emit("Players", players);
    } catch (err) {
      throw err;
    }
  };

  /////////////////
  /// Utilities ///
  /////////////////

  extractUsedCards = (game) => {
    try {
      return game.previousRounds.reduce(
        (aggr, value) => {
          const { blackCard, whiteCards } = value;
          aggr.blackCards.push(blackCard);
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
      const usedArray = usedBlackCards.map((a) => a.text);

      const availableBlackCards = filter(
        allBlackCards,
        (a) => !usedArray.includes(a.text)
      );

      return availableBlackCards[randomIndex(availableBlackCards.length)];
    } catch (err) {
      throw err;
    }
  };

  dealWhiteCards = async (gameID, packOverride, emitUpdates = true) => {
    try {
      const game = await this.findGame(gameID);

      if (!game) {
        let err = new Error();
        err.statusCode = 404;
        err.name = "GAME_NOT_FOUND";
        err.message = "The requested game could not be found";
        throw err;
      }

      const players = await this.Player.fetchPlayersInGame(gameID);

      if (!players) {
        let err = new Error();
        err.statusCode = 404;
        err.name = "PLAYERS_NOT_FOUND";
        err.message = "No players found for game " + gameID;
        throw err;
      }

      let pack = packOverride;
      if (!pack) {
        pack = await this.Pack.fetchCachedPack(game.packID);

        if (!pack) {
          let err = new Error();
          err.statusCode = 404;
          err.name = "PACK_NOT_FOUND";
          err.message = `Pack ${game.packID} could not be found`;
          throw err;
        }
      }

      // Get array of white cards used from the previous rounds
      let playedWhite = [];
      if (game.previousRounds.length > 0) {
        playedWhite = reduce(
          game.previousRounds,
          (aggr, value, key) => {
            aggr.push(flattenDeep(value.whiteCards));
            return aggr;
          },
          []
        );
      }

      // Remove the cards used from the cards in the original pack
      let availableWhite = [...pack.whiteCards].filter(
        (a) => !playedWhite.includes(a)
      );

      // For each player, work out how many cards they now need,
      // and assign them from the cards available, removing the
      // card from the array as we go
      await Promise.all(
        players.map(async (player) => {
          let cardsNeeded = 10 - player.hand.length;
          let newHand = [...player.hand];
          while (cardsNeeded > 0) {
            const dealIndex = randomIndex(availableWhite.length);
            newHand.push(availableWhite[dealIndex]);
            availableWhite.splice(dealIndex, 1);
            cardsNeeded--;
          }

          return await this.Player.updatePlayer(player.name, gameID, {
            hand: newHand,
            selected: [],
          });
        })
      );

      // Push out new hands to all players
      if (emitUpdates) {
        this.Player.emitUpdateAll(gameID);
      }
    } catch (err) {
      throw err;
    }
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
          ...game.currentRound,
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
      await this.dealWhiteCards(gameID, combinedPack, false);

      // 4. Commit to DB and send update to clients
      await this.updateGame(gameID, { ...newGameData });

      // 5. Set players status
      await this.Player.updatePlayersInGame(
        gameID,
        { state: "SELECTING" },
        { state: { $ne: "CZAR" } }
      );
      this.Player.emitUpdateAll(gameID);
    } catch (err) {
      if (typeof err === "Error") {
        throw err;
      } else {
        throw new Error(err);
      }
    }
  };

  gameProgressManager = async (gameID) => {
    try {
      const game = await this.findGame(gameID);
      if (!game) {
        let err = new Error();
        err.statusCode = 404;
        err.name = "GAME_NOT_FOUND";
        err.message = "The game could not be found";
        throw err;
      }

      const players = await this.Player.fetchPlayersInGame(gameID);

      /**
       * 1. All players have chosen
       */
      const playersCount = players.length;
      const playersSelectedCount = players
        .map((p) => p.state)
        .filter((s) => s === "SELECTED").length;
      // We minus one because there's always one player not selecting as they're choosing the best combination!
      if (
        playersSelectedCount === playersCount - 1 &&
        game.gameState !== "READING"
      ) {
        await this.setGameStateReading(gameID);
      }
    } catch (err) {
      throw err;
    }
  };

  setGameStateSelecting = async (gameID) => {
    try {
      await this.updateGame(gameID, { gameState: "SELECTING" });
      await this.Player.updatePlayersInGame(
        gameID,
        { state: "SELECTING" },
        { state: { $ne: "CZAR" } }
      );
      this.Player.emitUpdateAll(gameID);
      this.emitGameUpdate(gameID);
    } catch (err) {
      throw err;
    }
  };

  setGameStateReading = async (gameID) => {
    try {
      const game = await this.findGame(gameID);
      await this.updateGame(gameID, {
        gameState: "READING",
        currentRound: { ...game.currentRound, showWhite: true },
      });
      await this.Player.updatePlayersInGame(
        gameID,
        { state: "IDLE" },
        { state: { $ne: "CZAR" } }
      );
      this.Player.emitUpdateAll(gameID);
      this.emitGameUpdate(gameID);
    } catch (err) {
      throw err;
    }
  };

  setGameWinner = async (gameID, winner) => {
    try {
      const game = await this.findGame(gameID);
      await this.updateGame(gameID, {
        gameState: "WINNER",
        currentRound: {
          ...game.currentRound,
          winner,
        },
      });
      this.emitGameUpdate(gameID);

      setTimeout(() => {
        this.nextRound(gameID);
      }, 10000);
    } catch (err) {
      throw err;
    }
  };

  nextRound = async (gameID) => {
    try {
      const game = await this.findGame(gameID);
      const players = await this.Player.fetchPlayersInGame(gameID);
      const currentCzarIndex = findIndex(players, (p) => p.state === "CZAR");

      // Assign next czar
      await this.Player.selectNextCzar(gameID);

      await this.Player.updatePlayersInGame(
        gameID,
        { state: "SELECTING" },
        { state: { $ne: "CZAR" } }
      );
      await this.dealWhiteCards(gameID, null, false);

      let nextGame = {
        ...game,
        gameState: "SELECTING",
        currentRound: {
          blackCard: null,
          whiteCards: [],
          showBlack: true,
          showWhite: false,
          winner: null,
        },
        previousRounds: [
          ...game.previousRounds,
          { ...game.currentRound, czar: players[currentCzarIndex].name },
        ],
      };

      const nextBlackCard = await this.selectBlackCard(nextGame);
      nextGame.currentRound.blackCard = nextBlackCard;

      await this.updateGame(gameID, nextGame);

      // Send updates
      this.emitGameUpdate(gameID);
      this.Player.emitUpdateAll(gameID);
    } catch (err) {
      throw err;
    }
  };

  endGame = async (gameID) => {
    try {
      const game = await this.findGame(gameID);
      const newGameData = {
        ...game,
        gameState: "ENDED",
        currentRound: {
          blackCard: {},
          whiteCards: [],
          showBlack: false,
          showWhite: false,
          winner: {
            screenName: null,
            hand: [],
          },
        },
        previousRounds: [...game.previousRounds, game.currentRound],
        ended: moment().toISOString(),
      };
      await this.updateGame(gameID, newGameData);
      const winners = await this.fetchGameWinners(gameID);
      this.io.to(gameID).emit("EndGame", winners);
      return true;
    } catch (err) {
      throw err;
    }
  };
}

module.exports = GameController;
