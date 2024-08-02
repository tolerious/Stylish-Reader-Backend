const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { articleTokenModel } = require("../schemas/articleTokenSchema");
const { articleModel } = require("../schemas/articleSchema");
const { generateResponse } = require("../utils/utils");
module.exports = router;

async function convertDataToToken(articleId) {
  const article = await articleModel.findById(articleId);
  const enData = article.enTranscriptData;
  const events = JSON.parse(enData).events;
  const map = new Map();
  events.map((event) => {
    const newSegs = event.segs.map((seg) => seg.utf8);
    const newSegsArray = newSegs[0]
      .replaceAll("\n", " ")
      .split(" ")
      .map((seg) => ({
        text: seg,
        isHighLight: false,
        uuid: uuidv4(),
      }));
    map.set(event.tStartMs.toString(), {
      originTextString: newSegs[0],
      segs: newSegsArray,
    });
  });
  const m = new articleTokenModel({
    articleId: article._id,
    tokens: map,
  });
  return await m.save();
}

router.get("/", async function (req, res, next) {
  const articles = await articleModel.find({}).lean();
  articles.forEach(async (article, index) => {
    const a = await articleModel.findById(article._id);
    if (a) {
      console.log(`第 ${index + 1} 篇文章的token已经存在`);
    } else {
      const t = await convertDataToToken(article._id);
      console.log(`第 ${index + 1} 篇文章的token已经生成`);
    }
  });
  res.json(generateResponse(""));
});
