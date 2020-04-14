const path = require("path");
const fs = require("fs");

const packsPath = path.join(__dirname, "../packs");

class PackController {
  constructor() {
    this.packs = this.packNames();
  }

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
}

module.exports = PackController;
