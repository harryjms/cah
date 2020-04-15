const path = require("path");
const fs = require("fs");
const find = require("lodash/find");
const CAHController = require("./CAHController");
const PlayerController = require("./PlayerController");

const packsPath = path.join(__dirname, "../packs");

class PackController extends CAHController {
  constructor() {
    super();
    this.db = () => this.mongo().then((db) => db.collection("pack-cache"));
    this.packs = this.packNames();
  }

  ///////////////
  /// Databse ///
  ///////////////
  cachePack = async (pack) => {
    try {
      const cache = await this.db().then((col) => col.insertOne(pack));
      return cache.insertedId.toString();
    } catch (err) {
      throw err;
    }
  };

  fetchCachedPack = async (id) => {
    try {
      const pack = await this.db().then((col) =>
        col.findOne({ _id: this.ObjectID(id) })
      );
      return pack;
    } catch (err) {
      throw err;
    }
  };

  fetchSelectedWhiteCards = async (gameID) => {
    try {
      const Player = new PlayerController();
      const players = await Player.fetchPlayersInGame(gameID).then((players) =>
        players.toArray()
      );
      return players.reduce((aggr, value) => {
        aggr.push(value.selected);
        return aggr;
      }, []);
    } catch (err) {
      throw err;
    }
  };

  //////////////////////
  /// REST Endpoints ///
  //////////////////////

  /**
   * GET /api/packs
   */
  getPacks = (req, res, next) => {
    try {
      const packs = this.packs.map((pack) => ({
        name: this.nameOfPack(pack),
        key: pack,
      }));
      res.json(packs);
    } catch (err) {
      next(err);
    }
  };

  /////////////////
  /// Utilities ///
  /////////////////

  randomNumber = (max) => {
    return Math.floor(Math.random() * max + 1) - 1;
  };

  packFiles = () => {
    try {
      const packFiles = fs
        .readdirSync(packsPath)
        .map((pack) => packsPath + "/" + pack)
        .filter((a) => /.json$/.test(a));
      return packFiles;
    } catch (err) {
      throw err;
    }
  };

  packNames = () => {
    const files = this.packFiles();
    return files.map((file) => path.basename(file).replace(".json", ""));
  };

  exists = (name) => {
    return this.packs.includes(name);
  };

  openPack = (name) => {
    if (this.exists(name)) {
      const packContents = fs.readFileSync(
        path.join(packsPath, name + ".json")
      );

      return JSON.parse(packContents.toString());
    } else {
      let err = new Error();
      err.name = "PACK_NOT_FOUND";
      err.message = "The requested pack could not be found";
      err.statusCode = 404;
      throw err;
    }
  };

  nameOfPack = (pack) => {
    return this.openPack(pack).name;
  };

  compilePacks = (packs) => {
    try {
      let blackCards = {};
      let whiteCards = [];
      packs.forEach((packKey) => {
        const pack = this.openPack(packKey);
        blackCards = { ...blackCards, ...pack.blackCards };
        whiteCards = [...whiteCards, ...pack.whiteCards];
      });

      return {
        blackCards,
        whiteCards,
      };
    } catch (err) {
      throw err;
    }
  };
}

module.exports = PackController;
