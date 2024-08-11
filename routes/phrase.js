const express = require("express");
const router = express.Router();
const { phraseModel } = require("../schemas/phraseSchema");
const { generateResponse } = require("../utils/utils");

router.post("/", async function (req, res, next) {
  const body = req.body;
  const u = req.tUser;
  const { en, groupId } = body;
  const phrases = await phraseModel.find({ creator: u, en, groupId });
  if (phrases.length === 0) {
    const p = await phraseModel.create({ creator: u, en, groupId });
    res.json(generateResponse(p));
  } else {
    res.json(generateResponse("phrase exist", 400));
  }
});

router.post("/list", async function (req, res, next) {
  const u = req.tUser;
  const { groupId } = req.body;
  const phrases = await phraseModel.find(
    { creator: u, groupId },
    { creator: 0, __v: 0 }
  );
  res.json(phrases);
});

module.exports = router;
