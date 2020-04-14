const jwt = require("./jwt");
const cookie = require("cookie");
module.exports = cookie.parse;

module.exports.parseFromSocket = (socket) => {
  const c = cookie.parse(socket.client.request.headers.cookie);
  if (c && c["token"]) {
    try {
      const payload = jwt.verifyToken(c["token"]);
      return payload;
    } catch (error) {
      throw new Error(error);
    }
  }
};
