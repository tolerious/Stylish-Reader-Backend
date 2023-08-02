var express = require("express");
const { generateResponse, grabWordFromCambridge } = require("../utils/utils");
var router = express.Router();
const cheerio = require("cheerio");
const axios = require("axios");
/* GET home page. */
router.get("/", async function (req, res, next) {
  res.render("index", { title: "ddd" });
});

router.post("/grab", async function (req, res, next) {
  let word = req.body.word;
  let t = await grabWordFromCambridge(word);
  res.send(generateResponse(t));
});

module.exports = router;
