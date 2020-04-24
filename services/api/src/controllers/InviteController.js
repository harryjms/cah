const CAHController = require("./CAHController");

class InviteController extends CAHController {
  constructor() {
    super();
    this.db = () => this.mongo().then((db) => db.collection("invites"));
  }

  checkInvitation = async (code) => {
    try {
      const invitation = await this.db().then((coll) =>
        coll.findOne({ _id: this.ObjectID(code) })
      );
      return invitation ? true : false;
    } catch (err) {
      throw err;
    }
  };

  getCheckInite = async (req, res, next) => {
    try {
      const valid = await this.checkInvitation(req.params.code);
      if (valid) {
        res.cookie("invite", this.jwt.createToken({ invite: req.params.code }));
        res.sendStatus(200);
        3;
      } else {
        res.sendStatus(403);
      }
    } catch (err) {
      next(err);
    }
  };
}

module.exports = InviteController;
