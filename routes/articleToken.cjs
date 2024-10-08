const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { articleTokenModel } = require("../schemas/articleTokenSchema");
const { articleModel } = require("../schemas/articleSchema");
const { generateResponse, generateBadResponse } = require("../utils/utils");
const mongoose = require("mongoose");
module.exports = router;

async function convertDataToToken(articleId, userId) {
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
    creator: userId,
    articleId: article._id,
    youtubeVideoId: article.youtubeVideoId,
    tokens: map,
  });
  const to = await m.save();
  article.isTransformed = true;
  await article.save();
  return to;
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
  const u = req.tUser;
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
  const t = await convertDataToToken(articleId, u._id);
  res.json(generateResponse(t));
});

// 全部转换视频
router.get("/", async function (req, res, next) {
  try {
    const u = req.tUser;
    const articles = await articleModel.find({ creator: u._id }).lean();

    for (let [index, article] of articles.entries()) {
      const a = await articleTokenModel.findOne({ articleId: article._id });
      if (a) {
        console.log(
          `User Id: ${u._id}: 第 ${index + 1} 篇文章的token已经存在。`
        );
        const a = await articleModel.findById(article._id);
        a.isTransformed = true;
        await a.save();
      } else {
        if (article.enTranscriptData) {
          const t = await convertDataToToken(article._id, u._id);
          console.log(
            `User Id: ${u._id}: 第 ${index + 1} 篇文章的token生成成功。`
          );
        } else {
          console.log(
            `User Id: ${u._id}: 第 ${index + 1} 篇文章的enTranscriptData为空。`
          );
        }
      }
    }
    res.json(generateResponse(""));
  } catch (error) {
    res.json(generateBadResponse("", error.toString()));
  }
});
