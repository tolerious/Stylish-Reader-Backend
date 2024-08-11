const express = require("express");
const { generateResponse } = require("../utils/utils");
const { wordGroupModel } = require("../schemas/wordGroupSchema");
const { userSettingModel } = require("../schemas/userSettingsSchema");
const router = express.Router();
/* GET users listing. */
// 获取所有父亲词组
router.get("/", async function (req, res, next) {
  let user = req.tUser;
  let t = await wordGroupModel.getOnlyParentGroup(user._id).lean();
  let c = await wordGroupModel
    .aggregate([{ $match: { parentGroupID: { $ne: "" } } }])
    .group({ _id: "$parentGroupID", total: { $sum: 1 } });
  let r = c.reduce((acc, curr, index) => {
    acc[curr["_id"]] = curr["total"];
    return acc;
  }, {});
  let d = {
    aggregate: r,
    list: t,
  };
  res.json(generateResponse(d));
});

// 获取所有属于自己的子词组
router.get("/child", async function (req, res, next) {
  let user = req.tUser;
  let t = await wordGroupModel.getOnlyChildGroup(user._id);
  res.json(generateResponse(t));
});

// 创建词组
router.post("/", async function (req, res, next) {
  let user = req.tUser;
  let body = req.body;
  const { name } = req.body;
  const groups = await wordGroupModel.find({ name: name });
  if (groups.length > 0) {
    res.json(generateResponse(groups[0], 400));
  } else {
    Object.assign(body, {
      nickName: name,
      creator: user._id,
      parentGroupID: "",
    });
    let t = await wordGroupModel.create(body);
    res.json(generateResponse(t));
  }
});

router.post("/detail", async function (req, res, next) {
  let body = req.body;
  if (!body.groupID) res.json(generateResponse("", 400));
  let g = await wordGroupModel.findById({ _id: body.groupID }).lean();
  let t = await wordGroupModel.find({ parentGroupID: body.groupID }).lean();
  if (t.length > 0) g = Object.assign(g, { hasChild: true });
  else g = Object.assign(g, { hasChild: false });
  res.json(generateResponse(g));
});
router.delete("/", async function (req, res, next) {
  let id = req.body.id;
  let group = await wordGroupModel.findById(id);
  // 先判断是不是父亲词组，且其中没有孩子词组
  let g = await wordGroupModel.find({ parentGroupID: id });
  if (g.length > 0) {
    res.json(generateResponse("", 400, "Has children"));
    return;
  }
  // 否则是孩子词组，则继续判断该词组中是否有单词
  if (group.wordCount != 0) {
    res.json(generateResponse("", 400, "Contains words."));
  } else {
    const t = await wordGroupModel.findOneAndUpdate(
      { _id: id },
      { isVisible: false }
    );
    res.json(generateResponse(t));
  }
});
router.get("/public", async function (req, res, next) {
  let groupList = await wordGroupModel.getPublicGroup();
  res.json(generateResponse(groupList));
});

router.post("/copy", async function (req, res, next) {
  let b = req.body;
  if (!b.groupID) {
    res.json(generateResponse("", 400, "error"));
    return;
  }
  let f = await wordGroupModel.findOne({ _id: b.groupID }).lean();
  let o = { ...f };
  delete o._id;
  // let n = await wordGroupModel.create(o)
  // n.name = 'b'
  // n.save()
  res.json(generateResponse());
});

router.post("/update", async function (req, res, next) {
  let d = req.body;
  let r = await wordGroupModel.findOneAndUpdate({ _id: d.groupID }, d, {
    returnDocument: "after",
  });
  res.json(generateResponse(r));
});

// 获取某个父亲词组的所有孩子词组
router.post("/children", async function (req, res, next) {
  let d = req.body;
  let r = await wordGroupModel.find({ parentGroupID: d.parentGroupID });
  res.json(generateResponse(r));
});

router.post("/sharing/count", async function (req, res, next) {
  let d = req.body;
  let groupID = d.groupID;
  if (!groupID) {
    res.json(generateResponse("", 400, "Json data invalid."));
    return;
  }
  let g = await wordGroupModel.findById(groupID);
  let c = await wordGroupModel.countDocuments();
  res.json(
    generateResponse({
      wordCount: g.wordCount,
      videoCount: g.groupVideoUrl.split(",").filter((item) => {
        !item;
      }).length,
      audioCount: g.groupAudioUrl.split(",").filter((item) => {
        !item;
      }).length,
      articleCount: g.groupArticleUrl.split(",").filter((item) => {
        !item;
      }).length,
      groupCount: c,
    })
  );
});

router.get("/count", async function (req, res, next) {
  let c = await wordGroupModel.countDocuments();
  res.json(generateResponse(c));
});

router.post("/setparent", async function (req, res, next) {
  let d = req.body;
  let parentGroupID = d.parentGroupID;
  let childGroupID = d.childGroupID;
  let c = await wordGroupModel.findById(childGroupID);
  if (c.wordCount > 0) {
    res.json(generateResponse("", 400, "Parent group can not contain words"));
    return;
  }
  c.parentGroupID = parentGroupID;
  c.save();
  res.json(generateResponse(c));
});

module.exports = router;
