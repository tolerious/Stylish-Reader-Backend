const express = require("express");
const router = express.Router();
const rt = require("../schemas/userSchema");
const md5 = require("md5");
const { userModel } = rt;
const ut = require("../utils/utils");
const { generateResponse } = ut;

const jwt = require("jsonwebtoken");
const { smsCodeModel } = require("../schemas/smsCodeSchema");
const { wordGroupModel } = require("../schemas/wordGroupSchema");
const { userSettingModel } = require("../schemas/userSettingsSchema");

router.post("/exist", async function (req, res, next) {
  let b = req.body;
  let username = b.username;
  if (username) {
    let t = await userModel.findOne({ username });
    if (t) {
      res.json(generateResponse("", 200, "User exist"));
    } else {
      res.json(generateResponse("can", 200, ""));
    }
  } else {
    res.json(generateResponse("", 200, "User exist"));
  }
});

router.post("/create", async function (req, res, next) {
  let body = req.body;
  let username = body.username;
  let password = md5(body.password);
  let code = body.code;
  let source = "web";
  if (body.ignore && body.source && body.source !== "web") {
    source = body.source;
    console.log(`login without phone number.`);
  } else {
    // verify code
    let sms = await smsCodeModel.findOne({ username });
    if (!sms) {
      res.json(generateResponse("", 400, "send code first"));
      return;
    }
    if (code != sms.code) {
      res.json(generateResponse("", 400, "code not match"));
      return;
    }
  }

  // find user first
  const users = await userModel.getUserByUserName(username);
  if (users.length == 0) {
    const t = await userModel.create(
      Object.assign(body, { password }, { source })
    );
    const g = await wordGroupModel.create({ creator: t._id, isDefault: true });
    await userSettingModel.create({ userID: t._id, defaultGroupID: g._id });
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
