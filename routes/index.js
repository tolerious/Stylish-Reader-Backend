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
const { default: OpenAI } = require("openai");
const { articleModel } = require("../schemas/articleSchema");
const {
  theGuardianModel,
} = require("../schemas/supportedWebsite/theGuardianSchema");

router.get("/index", async function (req, res, next) {
  qrcode.toDataURL(
    "https://stylishreader.com",
    { version: 7 },
    function (err, url) {
      res.render("index", { title: url });
    }
  );
});

router.get("/newsinlevel", async function (req, res, next) {
  const url = `https://www.newsinlevels.com/products/what-people-ate-during-world-war-ii-level-1/#/`;
  const d = await axios({ url });
  console.log(d.data);
  res.json(generateResponse());
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
  try {
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
  } catch (error) {
    console.log(error);
    res.json(generateResponse({ dicList: [], phonetic: "" }));
  }
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

router.post("/deepseek", async function (req, res, next) {
  const openai = new OpenAI({
    baseURL: process.env.DEEP_SEEK_URL,
    apiKey: process.env.DEEP_SEEK_API_KEY,
  });
  const { articleId } = req.body;
  if (!articleId) {
    res.json(generateBadResponse());
    return;
  }
  const article = await theGuardianModel.findById(articleId).exec();
  const questions = article.questions;
  const answers = article.answers;
  if (questions && answers) {
    res.json(generateResponse({ questions, answers }));
    return;
  }
  const content = article.content;
  // console.log(content);
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `请根据这篇文章的内容，帮我出5个阅读理解题目，每个题目提供4个选项，题目和选项使用英文。答案和解析使用中文进行分析，答案和解析统一在所有题目后提供，问题和答案之间请使用三个感叹号进行分隔以。下是文章内容: ${content}`,
          // content: "你好",
        },
      ],
      model: "deepseek-chat",
    });

    // console.log(completion);
    // console.log(completion.choices[0].message.content);
    // console.log(typeof completion.choices[0].message.content);
    const replyContent = completion.choices[0].message.content;
    const questionList = replyContent.split("!!!")[0];
    const answerList = replyContent.split("!!!")[1];
    console.log(questionList);
    console.log(answerList);
    res.json(
      generateResponse({ content: completion.choices[0].message.content })
    );
  } catch (error) {
    console.log("deepseek error.");
    console.log(error);
    res.json(generateBadResponse());
  }
});

module.exports = router;
