const jwt = require("./jwt");
const cookie = require("cookie");
module.exports = cookie.parse;

module.exports.parseFromSocket = (socket) => {
  try {
    const c = cookie.parse(socket.client.request.headers.cookie);

    const payload = jwt.verifyToken(c["token"]);
    return payload;
  } catch (error) {
    throw new Error(error);
  }
};
