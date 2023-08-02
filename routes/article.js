var express = require("express");
var router = express.Router();
const rt = require("../schemas/articleSchema");
const { articleModel } = rt;
const ut = require("../utils/utils");
const { generateResponse } = ut;
const axios = require("axios").default;
/* GET users listing. */
router.get("/:id", async function (req, res, next) {
  try {
    let t = await articleModel.findById(req.params.id).exec();
    res.json(generateResponse(t));
  } catch (error) {
    res.json(generateResponse("", 400, "fail"));
  }
});

router.post("/", async function (req, res, next) {
  const body = req.body;
  const t = await articleModel.create(body);
  res.json(generateResponse(t));
});

router.post("/search/content", async function (req, res, next) {
  const content = req.body.content;
  const pageNo = req.body.pageNo - 1 < 0 ? 0 : req.body.pageNo - 1;
  let t = await articleModel.searchArticleByContent(content, pageNo);
  res.json(generateResponse(t));
});

router.put("/", async function (req, res, next) {
  try {
    let { body } = req;
    let doc = await articleModel.findByIdAndUpdate(body.id, body).exec();
    doc = await articleModel.findById(body.id);
    res.json(generateResponse(doc));
  } catch (error) {
    res.json(generateResponse("", 400, "fail"));
  }
});

router.delete("/", async function (req, res, next) {
  try {
    let id = req.body.id;
    let doc = await articleModel.findByIdAndDelete(id).exec();
    res.json(generateResponse(doc));
  } catch (error) {
    res.json(generateResponse("", 400, "fail"));
  }
});

router.get("/china/daily/list", function (req, res, next) {
  res.redirect("/article/china/daily/list/1");
});

router.get("/china/daily/list/:pageNo", async function (req, res, next) {
  let pageNo = req.params.pageNo || 1;
  let url = `https://chenxidaily.auoktalk.com/api/everyday/index/info/${pageNo}?channel=1&from=default&appContentCategory=5f213cf82d09e440d231fb&chapterId=&openId=oREjXwQYYEKtYiFu6W-pAP-r2U_4`;
  let results = (await axios.get(url)).data.data;
  let articles = results.data.content;
  let totalPages = Number.parseInt(results.data.totalPages);

  res.render("chinaDaily", {
    totalPages,
    articles,
  });
});

router.get("/china/daily", function (req, res, next) {
  res.redirect("/article/china/daily/b9e17fd8-09e2-401a-ba59-383aa485f164");
});

router.get("/china/daily/:articleID", async function (req, res, next) {
  let articleID =
    req.params.articleID || "b9e17fd8-09e2-401a-ba59-383aa485f164";
  let contentURL = `https://chenxidaily.auoktalk.com/api/everyday/get/content/${articleID}?channel=1&from=default&openId=oREjXwQYYEKtYiFu6W-pAP-r2U_4&cibaId=oREjXwQYYEKtYiFu6W-pAP-r2U_4`;
  const r = await axios.get(contentURL);
  const a = await axios.get(
    `https://chenxidaily.auoktalk.com/api/everyday/get/chapter/exam/${articleID}?channel=1&from=default&openId=oREjXwQYYEKtYiFu6W-pAP-r2U_4&cibaId=oREjXwQYYEKtYiFu6W-pAP-r2U_4`
  );
  let data = r.data.data;
  let adata = a.data.data;
  let att = adata.data.filter((item) => item.examEn);
  let atts = att.map((item) => {
    item.blankWord.sort((a, b) => {
      return a.index - b.index;
    });
    return item.blankWord;
  });

  res.render("article", {
    title: data.enTitle + "   " + data.chTitle,
    enTitle: data.enTitle,
    chTitle: data.chTitle,
    label: data.label,
    date: data.date,
    level: data.level,
    author: data.authorizer,
    articleImg: data.articleImg,
    preReadQuestion: data.preReadQuestion,
    article: data.article,
    voiceUrl: data.voiceUrl,
    explainVoiceUrl: data.explainVoiceUrl,
    firstMinuteUrl: data.firstMinuteUrl,
    introduction: data.introduction,
    knowledgeList: data.knowledgeList,
    examList: adata.data,
    answerList: atts,
  });
});
module.exports = router;
