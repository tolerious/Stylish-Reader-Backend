const express = require("express");
const {
  generateResponse,
  grabWordFromCambridge,
  generateBadResponse,
} = require("../utils/utils");
const router = express.Router();
const qrcode = require("qrcode");
const cheerio = require("cheerio");
const Parser = require("@postlight/parser");
const { default: axios } = require("axios");

router.get("/index", async function (req, res, next) {
  qrcode.toDataURL(
    "https://stylishreader.com",
    { version: 7 },
    function (err, url) {
      res.render("index", { title: url });
    }
  );
});

router.post("/youdao", async function (req, res, next) {
  const word = req.body.word;
  const url = `https://dict.youdao.com/dictvoice?type=1&audio=${word}`;
  const d = await axios({ url, method: "GET", responseType: "stream" });
  res.setHeader("Content-Type", "audio/mpeg");
  d.data.pipe(res);
});

router.post("/translation/content/", async function (req, res, next) {
  const { word } = req.body;
  if (!word) {
    res.json(generateBadResponse());
    return;
  }
  const textToBeTranslated = word
    .replaceAll("&", "")
    .replaceAll("\r", "")
    .replaceAll("\n", " ");
  console.log(`Original content: ${textToBeTranslated}`);
  const url = `https://dict.youdao.com/result?word=${textToBeTranslated}&lang=en`;
  let dicList = [];
  const a = await axios(url);

  const $ = cheerio.load(a.data);
  const dictBook = $(".basic .word-exp");
  let phonetic = "";
  const yinBiao = $(".phone_con .phonetic");
  yinBiao.each((index, element) => {
    phonetic += $(element).text() + "  ";
  });
  dictBook.each((index, element) => {
    const ciXing = $(element).find(".pos");
    const zh = $(element).find(".trans");
    dicList.push({ pos: $(ciXing).text(), zh: $(zh).text() });
  });
  const dictBookSecond = $(".dict-module .trans-container .trans-content");
  dicList.push({ pos: "", zh: $(dictBookSecond).text() });
  console.log(dicList);
  res.json(generateResponse({ dicList, phonetic }));
});

router.post("/grab", async function (req, res, next) {
  let word = req.body.word;
  let t = await grabWordFromCambridge(word);
  res.send(generateResponse(t));
});

router.get("/test", async function (req, res, next) {
  let url = `https://www.chinadaily.com.cn/a/202402/21/WS65d5e80aa31082fc043b85d4.html`;

  const customExtractor = {
    domain: "www.chinadaily.com.cn",
    title: {
      selectors: [],
    },
    author: {
      selectors: [".info_l"],
    },
    content: {
      selectors: ["#Content"],
    },
  };
  Parser.addExtractor(customExtractor);
  let r = await Parser.parse(url);
  res.send(generateResponse(r));
});

module.exports = router;
