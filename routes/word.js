var express = require("express");
const { generateResponse, grabWordFromCambridge } = require("../utils/utils");
const { wordModel } = require("../schemas/wordSchema");
const { wordGroupModel } = require("../schemas/wordGroupSchema");
var router = express.Router();
/* GET users listing. */
router.get("/:id", async function (req, res, next) {
  try {
    let t = await wordModel.getWord(req.params.id).exec();
    res.json(generateResponse(t));
  } catch (error) {
    res.json(generateResponse(error, 400, "fail"));
  }
});

router.post("/grab", async function (req, res, next) {
  let word = req.body.word || "";
  let t = await grabWordFromCambridge(word);
  res.send(generateResponse(t));
});

router.post("/list", async function (req, res, next) {
  let t = await wordModel
    .getWordList(req.body.pageSize, req.body.pageNo)
    .exec();
  let count = await wordModel.getWordListCount();
  res.json(generateResponse({ total: count, list: t }));
});

router.post("/bygroup", async function (req, res, next) {
  let b = req.body;
  let n = await wordModel.find({ groupID: b.groupID });
  res.json(generateResponse(n));
});

// 新建单词
router.post("/", async function (req, res, next) {
  const body = req.body;
  let groupID = body.groupID;
  let groupItem = await wordGroupModel.find({ _id: groupID });
  if (groupItem.length != 1)
    res.json(generateResponse("", 400, "Word group doesn't exist."));
  groupItem[0].wordCount++;
  groupItem[0].save();
  const t = await wordModel.create(body);
  res.json(generateResponse(t));
});

router.put("/:id", async function (req, res, next) {
  try {
    let { body } = req;
    let doc = await wordModel.findByIdAndUpdate(body.id, body).exec();
    doc = await wordModel.findById(body.id);
    res.json(generateResponse(doc));
  } catch (error) {
    res.json(generateResponse(error, 400, "fail"));
  }
});

router.delete("/", async function (req, res, next) {
  try {
    let id = req.body.id;
    let groupID = req.body.groupID;
    let group = await wordGroupModel.find({ _id: groupID });
    if (group.length != 1)
      res.json(generateResponse("", 400, "Word group doesn't exist."));
    group[0].wordCount--;
    if (group[0].wordCount < 0) group[0].wordCount = 0;
    group[0].save();
    let doc = await wordModel.findByIdAndDelete(id).exec();
    res.json(generateResponse(doc));
  } catch (error) {
    res.json(generateResponse("", 400, "fail"));
  }
});
module.exports = router;
