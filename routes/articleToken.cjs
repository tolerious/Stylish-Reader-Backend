const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { articleTokenModel } = require("../schemas/articleTokenSchema");
const { articleModel } = require("../schemas/articleSchema");
const { generateResponse } = require("../utils/utils");
module.exports = router;

router.get("/", async function (req, res, next) {
  const article = await articleModel.findById("66952140dae8d588d9484ee7");
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
    articleId: "66952140dae8d588d9484ee7",
    tokens: map,
  });
  await m.save();
  res.json(generateResponse(events));
});
