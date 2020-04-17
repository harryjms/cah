const jwt = require("./jwt");
const cookie = require("cookie");
module.exports = cookie.parse;

module.exports.parseFromSocket = (socket) => {
  try {
    if (socket.client.request.headers.cookie) {
      const c = cookie.parse(socket.client.request.headers.cookie || "");
      if (c["token"]) {
        const payload = jwt.verifyToken(c["token"]);
        return payload;
      }
    }
  } catch (error) {
    throw new Error(error);
  }
};
