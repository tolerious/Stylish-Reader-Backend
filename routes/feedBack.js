const express = require("express");
const router = express.Router();
const feedBackSchema = require("../schemas/feedBackSchema");
const { feedBackModel } = feedBackSchema;
const ut = require("../utils/utils");
const { generateResponse } = ut;

router.post("/", async function (req, res, next) {
  const u = req.tUser;
  const { content } = req.body;
  if (!content) {
    res.json(ut.generateBadResponse());
    return;
  }
  const t = await feedBackModel.create({ creator: u._id, content });
  res.json(generateResponse(t));
});

module.exports = router;
