var express = require("express");
var router = express.Router();
const rt = require("../schemas/userSchema");
const md5 = require("md5");
const { userModel } = rt;
const ut = require("../utils/utils");
const { generateResponse } = ut;

var jwt = require("jsonwebtoken");
router.post("/create", async function (req, res, next) {
  let body = req.body;
  let username = body.username;
  let password = md5(body.password);
  // find user first
  const users = await userModel.getUserByUserName(username);
  if (users.length == 0) {
    const t = await userModel.create(Object.assign(body, { password }));
    res.json(generateResponse(t));
  } else {
    res.json(generateResponse("", 400, "user exist"));
  }
});

/* GET users listing. */
router.get("/list", async function (req, res, next) {
  req.headers.authorization.replace(/bearer/i, "").trim();

  let payload = {
    username: "tolerious",
    password: "fenghelong",
  };
  // let r = jwt.sign(
  //   {
  //     data: payload,
  //     exp: Math.floor(Date.now() / 1000) + 60 * 60,
  //   },
  //   "english-burning"
  // );

  jwt.verify(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRvbGVyaW91cyIsInBhc3N3b3JkIjoiZmVuZ2hlbG9uZyIsImlhdCI6MTY4ODk3MTg4NX0.VrmAvl7JSyxsay5wBvP4kePt8cUWw9RhDNAs9vM78-k",
    "english-burning",
    function (err, decode) {
      if (err != null) res.json(generateResponse("", 400, "fail"));
      else res.json(generateResponse(decode));
    }
  );
});

module.exports = router;
