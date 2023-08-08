var express = require("express");
const { generateResponse, createClient } = require("../utils/utils");
const { smsCodeModel } = require("../schemas/smsCodeSchema");
var router = express.Router();
/* GET home page. */
router.post("/", async function (req, res, next) {
  let t = req.body;
  let username = t.username || undefined;
  if (!username) res.json(generateResponse("", 400, "invalid username"));
  let c = await smsCodeModel.generateCode(username);
  res.json(generateResponse(c));
});

module.exports = router;
