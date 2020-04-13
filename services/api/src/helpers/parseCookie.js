module.exports = (cookies) =>
  cookies &&
  cookies
    .split("; ")
    .map((cookie) => cookie.split("="))
    .map((cookie) => ({ [cookie[0]]: cookie[1] }))[0];
