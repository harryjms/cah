const path = require("path");
const fs = require("fs");
const CAHController = require("./CAHController");

const packsPath = path.join(__dirname, "../packs");

class PackController extends CAHController {
  constructor() {
    super();
    this.packs = this.packNames();
  }

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

  packFiles = () => {
    try {
      const packFiles = fs
        .readdirSync(packsPath)
        .map((pack) => packsPath + "/" + pack)
        .filter((a) => /.json$/.test(a));
      return packFiles;
    } catch (err) {
      throw new Error(err);
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
}

module.exports = PackController;
