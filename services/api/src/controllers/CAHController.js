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
    this.ObjectID = (id) => new this.mongo.ObjectID(id);
  }

  logDev(...args) {
    if (__DEV__) {
      this.log(...args);
    }
  }

  log(...args) {
    console.log(...args);
  }
}

module.exports = CAHController;
