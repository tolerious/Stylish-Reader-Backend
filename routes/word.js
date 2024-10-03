const express = require("express");
const { generateResponse, grabWordFromCambridge } = require("../utils/utils");
const { wordModel } = require("../schemas/wordSchema");
const { wordGroupModel } = require("../schemas/wordGroupSchema");
const { userSettingModel } = require("../schemas/userSettingsSchema");
const router = express.Router();
const mongoose = require("mongoose");

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

router.get("/only/one", async function (req, res, next) {
  let u = req.tUser;
  let count = await wordModel.count({ creator: u._id });
  let random = Math.floor(Math.random() * Math.floor(count));
  let wordItem = await wordModel.find({ creator: u._id }, null, {
    limit: 1,
    skip: random,
  });
  res.json(generateResponse(wordItem));
});

router.post("/list", async function (req, res, next) {
  let t = await wordModel
    .getWordList(req.body.pageSize, req.body.pageNo)
    .exec();
  let count = await wordModel.getWordListCount();
  res.json(generateResponse({ total: count, list: t }));
});

router.post("/bygroup", async function (req, res, next) {
  const b = req.body;
  const user = req.tUser;
  if (!b.groupId) {
    res.json(generateResponse("", 400, "Json format failed."));
    return;
  }
  const n = await wordModel.find({ groupID: b.groupId, creator: user._id });
  res.json(generateResponse(n));
});

// 新建单词
router.post("/", async function (req, res, next) {
  const body = req.body;
  const groupID = body.groupId;
  const u = req.tUser;
  if (body.en === undefined || body.en.trim() === "") {
    res.json(generateResponse("", 400, "Please provide a word to save."));
    return;
  }
  if (body.en.trim().split(" ").length > 1) {
    res.json(
      generateResponse("", 400, "Phrase is not allowed to save as a word.")
    );
    return;
  }

  // 必须传 groupId
  if (!mongoose.Types.ObjectId.isValid(groupID)) {
    res.json(generateResponse("", 400, "Invalid groupId"));
    return;
  }
  Object.assign(body, { creator: u._id });

  const groupItem = await wordGroupModel.findById(groupID);
  if (!groupItem) {
    res.json(generateResponse("", 400, "Group not exist."));
    return;
  }
  // 先去查找下这个group下面有没有已经存在该单词了，也就是说，不同的group下面可以建立相同的单词
  let w = await wordModel.find({ groupID: groupItem._id }).lean();
  let targetWord = w.find((word) => word.en === body.en.toLowerCase());
  if (targetWord) {
    res.json(generateResponse("", 400, "Word already Exist"));
  } else {
    const t = await wordModel.create({
      ...body,
      groupID: groupItem._id,
      en: body.en.toLowerCase(),
    });
    groupItem.wordCount++;
    await groupItem.save();
    res.json(generateResponse(t));
  }
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

// 删除某个单词
router.post("/delete", async function (req, res, next) {
  let id = req.body.id;
  let groupId = req.body.groupId;
  const user = req.tUser;
  const words = await wordModel.find({ creator: user._id, _id: id });
  if (words.length === 0) {
    res.json(generateResponse("", 400, "Word not found"));
    return;
  }
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    res.json(generateResponse("", 400, "GroupId is invalid"));
    return;
  }
  const group = await wordGroupModel.findById(groupId);
  group.wordCount--;
  if (group.wordCount < 0) group[0].wordCount = 0;
  await group.save();
  let doc = await wordModel.findByIdAndDelete(id).exec();
  res.json(generateResponse(doc));
});

// 判断某个单词是否被收藏过了
router.post("/search", async function (req, res, next) {
  const body = req.body;
  if (!body.en) {
    res.json(generateResponse("", 400, "Please provide a word to search."));
  } else {
    const words = await wordModel.find({ en: body.en, creator: req.tUser._id });
    res.json(generateResponse({ isLiked: words.length > 0 }));
  }
});

// 通过单词获取该单词的id
router.post("/word/id", async function (req, res, next) {
  let en = req.body.en;
  if (en === undefined) {
    res.json(generateResponse("", 400, ""));
  } else {
    let t = await wordModel.getId(en);
    res.json(generateResponse(t));
  }
});

// 获取用户所有的单词
router.post("/whole", async function (req, res, next) {
  const user = req.tUser;
  const words = await wordModel.find({ creator: user });
  res.json(generateResponse(words));
});

module.exports = router;
