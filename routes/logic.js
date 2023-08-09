var express = require("express");
var router = express.Router();
const md5 = require("md5");
const rt = require("../schemas/articleSchema");
const { articleModel } = rt;
const ut = require("../utils/utils");
const jwt = require("jsonwebtoken");
const { userModel } = require("../schemas/userSchema");
const { generateResponse } = ut;

router.get("/pingpong", function (req, res, next) {
  res.json(generateResponse());
});

router.post("/login", async function (req, res, next) {
  let body = req.body;
  let payload = { username: body.username, password: body.password };
  // find user
  let users = await userModel.getUserByUserName(body.username);

  if (users.length != 1) {
    res.json(generateResponse("", 400, "username or password is invalid"));
    return;
  } else {
    if (md5(body.password) != users[0].password) {
      res.json(generateResponse("", 400, "username or password is invalid"));
      return;
    }
    // one hour expiration
    // TODO: string 'english-burning' can be a global or config variable
    let r = await jwt.sign(
      {
        data: payload,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 60,
      },
      "english-burning"
    );
    users[0].token = r;
    users[0].save();
    res.json(generateResponse({ token: r }));
  }
});

module.exports = router;
