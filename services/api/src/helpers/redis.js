const redis = require("redis");

const { REDIS_HOST } = process.env;
const client = redis.createClient({ host: REDIS_HOST });

module.exports = client;
