var express = require("express");
const { generateResponse } = require("../utils/utils");
const { smsCodeModel } = require("../schemas/smsCodeSchema");
var router = express.Router();
const { default: Dysmsapi20170525 } = require("@alicloud/dysmsapi20170525");
const { Config } = require("@alicloud/openapi-client");
const { default: Credential } = require("@alicloud/credentials");

/* GET home page. */
router.post("/", async function (req, res, next) {
  console.log(process.env.ACCESS_KEY_ID);
  let t = req.body;
  let username = t.username || undefined;
  if (!username) res.json(generateResponse("", 400, "invalid username"));
  let c = await smsCodeModel.generateCode(username);
  console.log(c.code);
  const config = new Config({
    credential: new Credential(),
    regionId: "cn-hangzhou",
    protocol: "http",
    accessKeyId: process.env.ACCESS_KEY_ID,
    accessKeySecret: process.env.ACCESS_KEY_SECRET,
  });
  const dysmsapiClient = new Dysmsapi20170525(config);
  let ts = await dysmsapiClient.sendSms({
    phoneNumbers: username,
    signName: "燃烧吧英语",
    templateCode: "SMS_164065783",
    templateParam: `{"code":"${c.code}"}`,
  });
  console.log(ts);
  res.json(generateResponse(c));
});

module.exports = router;
