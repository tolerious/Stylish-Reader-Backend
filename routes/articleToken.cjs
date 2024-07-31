const express = require("express");
const router = express.Router();
const { articleTokenModel } = require("../schemas/articleTokenSchema");
const { articleModel } = require("../schemas/articleSchema");
const { generateResponse } = require("../utils/utils");
module.exports = router;

router.get("/", async function (req, res, next) {
  const articles = await articleModel.find();
  res.json(generateResponse(articles));
});
