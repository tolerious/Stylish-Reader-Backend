var express = require("express");
const { generateResponse } = require("../utils/utils");
const { wordGroupModel } = require("../schemas/wordGroupSchema");
const { userSettingModel } = require("../schemas/userSettingsSchema");
var router = express.Router();
/* GET users listing. */
router.get("/", async function (req, res, next) {
  let user = req.tUser;
  let t = await wordGroupModel.getMyGroup(user._id);
  res.json(generateResponse(t));
});

router.post("/", async function (req, res, next) {
  let user = req.tUser;
  let body = req.body;
  Object.assign(body, { userID: user._id });
  let t = await wordGroupModel.create(body);
  res.json(generateResponse(t));
});

router.delete("/", async function (req, res, next) {
  let id = req.body.id;
  let group = await wordGroupModel.findById(id);
  if (group.wordCount != 0) {
    res.json(generateResponse("", 400, "Contains words."));
  } else {
    let doc = await wordGroupModel.findByIdAndDelete(id).exec();
    await userSettingModel.deleteOne({ defaultGroupID: id });
    res.json(generateResponse(doc));
  }
});

module.exports = router;
