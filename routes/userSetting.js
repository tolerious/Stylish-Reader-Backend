const express = require("express");
const { generateResponse, grabWordFromCambridge } = require("../utils/utils");
const { userSettingModel } = require("../schemas/userSettingsSchema");
const router = express.Router();

// 获取用户settings
router.get("/", async function (req, res, next) {
  const u = req.tUser;
  let r = await userSettingModel.findOne({ userID: u._id });
  res.json(generateResponse(r));
});

// 创建或者更新用户settings
router.post("/", async function (req, res, next) {
  let d = req.body;
  let u = req.tUser;
  let r = await userSettingModel.find({ userID: u._id });
  let t;
  if (r.length == 0) {
    Object.assign(d, { userID: u._id });
    t = await userSettingModel.create(d);
  } else {
    t = await userSettingModel.findOneAndUpdate({ userID: u._id }, d);
  }
  res.json(generateResponse(t));
});

module.exports = router;
