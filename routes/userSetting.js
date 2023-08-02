var express = require("express");
const { generateResponse, grabWordFromCambridge } = require("../utils/utils");
const { userSettingModel } = require("../schemas/userSettingsSchema");
var router = express.Router();
/* GET home page. */
router.get("/", async function (req, res, next) {
  const u = req.tUser;
  let r = await userSettingModel.find({ userID: u._id });
  res.json(generateResponse(r));
});

router.post("/", async function (req, res, next) {
  let d = req.body;
  let u = req.tUser;
  let r = await userSettingModel.find({ userID: u._id });
  let t;
  if (r.length == 0) {
    Object.assign(d, { userID: u._id });
    t = await userSettingModel.create(d);
  } else {
    t = await userSettingModel.findOneAndUpdate(
      { userID: u._id },
      { defaultGroupID: d.defaultGroupID }
    );
  }
  res.json(generateResponse(t));
});

module.exports = router;
