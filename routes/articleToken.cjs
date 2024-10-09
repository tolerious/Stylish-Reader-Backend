const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { articleTokenModel } = require("../schemas/articleTokenSchema");
const { articleModel } = require("../schemas/articleSchema");
const { generateResponse } = require("../utils/utils");
const mongoose = require("mongoose");
module.exports = router;

async function convertDataToToken(articleId) {
  const article = await articleModel.findById(articleId);
  const enData = article.enTranscriptData;
  const events = JSON.parse(enData).events;
  const map = new Map();
  events.map((event) => {
    if (event.segs) {
      const newSegs = event.segs.map((seg) => seg.utf8).join("");
      const newSegsArray = newSegs
        .replaceAll("\n", " ")
        .split(" ")
        .map((seg) => ({
          text: seg,
          isHighLight: false,
          uuid: uuidv4(),
        }));

      map.set(
        event.tStartMs.toString() +
          "-" +
          (event.dDurationMs ? event.dDurationMs.toString() : "newline"),
        {
          originTextString: newSegs,
          segs: newSegsArray,
        }
      );
    }
  });
  const m = new articleTokenModel({
    articleId: article._id,
    youtubeVideoId: article.youtubeVideoId,
    tokens: map,
  });
  return await m.save();
}

router.post("/detail", async function (req, res, next) {
  const youtubeVideoId = req.body.youtubeVideoId;
  if (!youtubeVideoId) {
    res.json(generateResponse("", 400, "youtubeVideoId is required"));
    return;
  }
  const at = await articleTokenModel.findOne({ youtubeVideoId });
  res.json(generateResponse(at));
});

// 转换单个视频
router.post("/", async function (req, res, next) {
  const { articleId } = req.body;
  if (!articleId) {
    res.json(generateResponse("", 400, "articleId is required"));
    return;
  }
  if (!mongoose.Types.ObjectId.isValid(articleId)) {
    res.json(generateResponse("", 400, "articleId is invalid"));
    return;
  }
  const article = await articleModel.findById(articleId);
  if (!article) {
    res.json(generateResponse("", 400, "article not found"));
    return;
  }
  const t = await convertDataToToken(articleId);
  res.json(generateResponse(t));
});

// 全部转换视频
router.get("/", async function (req, res, next) {
  const u = req.tUser;
  const articles = await articleModel.find({ creator: u._id }).lean();

  for (let [index, article] of articles.entries()) {
    const a = await articleTokenModel.findOne({ articleId: article._id });
    if (a) {
      console.log(`User Id: ${u._id}: 第 ${index + 1} 篇文章的token已经存在。`);
    } else {
      const t = await convertDataToToken(article._id);
      console.log(`User Id: ${u._id}: 第 ${index + 1} 篇文章的token生成成功。`);
    }
  }
  res.json(generateResponse(""));
});
