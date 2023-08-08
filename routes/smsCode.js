var express = require("express");
const { generateResponse, createClient } = require("../utils/utils");
const { smsCodeModel } = require("../schemas/smsCodeSchema");
const { default: Client } = require("../utils/client");
var router = express.Router();
/* GET home page. */
router.post("/", async function (req, res, next) {
  let t = req.body;
  let username = t.username || undefined;
  if (!username) res.json(generateResponse("", 400, "invalid username"));
  let c = await smsCodeModel.generateCode(username);
  Client.main()
  res.json(generateResponse(c));
});

module.exports = router;
