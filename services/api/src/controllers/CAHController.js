const router = require("express").Router();
const { ObjectID } = require("mongodb");
const mongo = require("../helpers/mongo");
const cookieParse = require("../helpers/parseCookie");
const jwt = require("../helpers/jwt");
const socketio = require("../").socketio;

const __DEV__ = process.env.NODE_ENV === "development";

class CAHController {
  constructor() {
    this.router = router;
    this.mongo = mongo;
    this.jwt = jwt;
    this.io = socketio;
  }

  logInfo(...args) {
    if (__DEV__) {
      console.log(...args);
    }
  }
}

module.exports = CAHController;
