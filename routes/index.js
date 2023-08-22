var express = require("express");
const { generateResponse, grabWordFromCambridge } = require("../utils/utils");
var router = express.Router();
const cheerio = require("cheerio");
const axios = require("axios");
const qrcode = require('qrcode')
/* GET home page. */
router.get("/", async function (req, res, next) {
  qrcode.toDataURL('https://englishburning.com', { version: 7 }, function (err, url) {
    res.render("index", { title: url });

  })
});

router.post("/grab", async function (req, res, next) {
  let word = req.body.word;
  let t = await grabWordFromCambridge(word);
  res.send(generateResponse(t));
});

module.exports = router;
