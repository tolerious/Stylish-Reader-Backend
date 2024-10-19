const express = require("express");
const { generateResponse, generateBadResponse } = require("../utils/utils");
const { wordGroupModel } = require("../schemas/wordGroupSchema");
const { userSettingModel } = require("../schemas/userSettingsSchema");
const { default: mongoose } = require("mongoose");
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

// 创建词组,createdSource必传
router.post("/", async function (req, res, next) {
  let user = req.tUser;
  // 检查创建来源
  const { createdSource, originalPageUrl, name } = req.body;
  if (!createdSource) {
    res.json(generateResponse("", 400, "data format not correct"));
    return;
  }
  switch (createdSource) {
    case "extension": {
      if (!originalPageUrl) {
        res.json(generateResponse("", 400, "data format not correct"));
        return;
      }
      const groups = await wordGroupModel.getGroupsByOriginalPageUrlAndUserId(
        originalPageUrl,
        user
      );
      if (groups.length === 0) {
        const g = await wordGroupModel.create({
          ...req.body,
          creator: user._id,
        });
        res.json(generateResponse(g, 200));
      } else {
        const g = groups[0];
        res.json(generateResponse(g, 200));
      }
      return;
    }
    case "manually": {
      if (!name) {
        res.json(generateBadResponse());
      }
      const groups = await wordGroupModel.getGroupByNameAndUserId(name, user);
      if (groups.length === 0) {
        const g = await wordGroupModel.create({
          ...req.body,
          creator: user._id,
        });
        res.json(generateResponse(g));
      } else {
        res.json(generateResponse(groups[0], 200, "exist"));
      }
      return;
    }
    default:
      res.json(generateResponse("", 400));
      break;
  }
});

router.post("/detail", async function (req, res, next) {
  const { groupID } = req.body;
  const u = req.tUser;
  if (!mongoose.Types.ObjectId.isValid(groupID)) {
    res.json(generateBadResponse("", "Group id is invalid."));
    return;
  }
  let g = await wordGroupModel.findOne({ creator: u._id, _id: groupID });
  if (!g) {
    res.json(generateBadResponse("", "No group found."));
    return;
  }
  let t = await wordGroupModel.find({ parentGroupID: groupID }).lean();
  if (t.length > 0) {
    g = Object.assign(g, { hasChild: true });
  } else {
    g = Object.assign(g, { hasChild: false });
  }
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
