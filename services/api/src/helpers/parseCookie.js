const jwt = require("./jwt");
const cookieParse = (cookies) =>
  cookies &&
  cookies
    .split("; ")
    .map((cookie) => cookie.split("="))
    .map((cookie) => ({ [cookie[0]]: cookie[1] }))[0];
module.exports = cookieParse;

module.exports.parseFromSocket = (socket) => {
  const { cookie } = socket.client.request.headers;
  const c = cookieParse(cookie);
  if (c && c["token"]) {
    try {
      const payload = jwt.verifyToken(c["token"]);
      return payload;
    } catch (error) {
      throw new Error(error);
    }
  }
};
