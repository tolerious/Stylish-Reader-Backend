const express = require("express");
const router = express.Router();
const rt = require("../schemas/articleSchema");
const { articleModel } = rt;
const ut = require("../utils/utils");
const { generateResponse } = ut;
const axios = require("axios").default;
// Get article detail
router.get("/:id", async function (req, res, next) {
  try {
    let t = await articleModel.findById(req.params.id).exec();
    res.json(generateResponse(t));
  } catch (error) {
    res.json(generateResponse("", 400, "fail"));
  }
});

router.get("/youtube/detail/:youtubeId", async function (req, res, next) {
  const u = req.tUser;
  const r = await articleModel.find({
    youtubeVideoId: req.params.youtubeId,
    creator: u._id,
  });
  if (r.length !== 1) {
    res.json(generateResponse("", 400, "fail"));
  } else {
    res.json(generateResponse(r[0]));
  }
});

router.get("/youtube/list", async function (req, res, next) {
  const u = req.tUser;
  const r = await articleModel.find(
    { tags: { $elemMatch: { $eq: "youtube" } }, creator: u._id },
    "title _id createdAt youtubeVideoId"
  );
  res.json(generateResponse(r));
});

// 查询是否存在youtube视频
router.post("/youtube", async function (req, res, next) {
  const body = req.body;
  const u = req.tUser;
  const r = await articleModel.find({
    creator: u._id,
    youtubeVideoId: body.videoId,
  });
  res.json(generateResponse(r));
});

router.post("/", async function (req, res, next) {
  const body = req.body;
  const u = req.tUser;
  Object.assign(body, { creator: u._id });
  const r = await articleModel.searchArticleByCreatorAndLink(u._id, body.link);
  let t;
  if (r.length === 0) {
    t = await articleModel.create(body);
  } else {
    t = r[0];
  }
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
