const express = require("express");
const router = express.Router();
const rt = require("../schemas/articleSchema");
const {
  theGuardianModel,
} = require("../schemas/supportedWebsite/theGuardianSchema");
const { wordGroupModel } = require("../schemas/wordGroupSchema");
const { articleModel } = rt;
const ut = require("../utils/utils");
const { generateResponse, generateBadResponse } = ut;
const axios = require("axios").default;
const cheerio = require("cheerio");
const {
  newsInLevelsModel,
} = require("../schemas/supportedWebsite/newsInLevelsSchema");

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
  const r = await articleModel
    .find(
      { tags: { $elemMatch: { $eq: "youtube" } }, creator: u._id },
      "title _id createdAt youtubeVideoId isTransformed"
    )
    .sort({ createdAt: -1 });
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

router.post("/delete", async function (req, res, next) {
  try {
    let id = req.body.articleId;
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

async function parseNewsInLevelsItemAndCreate(html) {
  const $ = cheerio.load(html);
  const cover = $(".img-wrap a img").attr("src");
  const title = $(".news-block-right .title a").text().trim();
  const excerpt = $(".news-block-right .news-excerpt")
    .contents()
    .eq(2)
    .text()
    .trim();
  const level1Url = $(".fancy-buttons ul")
    .children("li")
    .eq(0)
    .find("a")
    .attr("href");
  const level2Url = $(".fancy-buttons ul")
    .children("li")
    .eq(1)
    .find("a")
    .attr("href");
  const level3Url = $(".fancy-buttons ul")
    .children("li")
    .eq(2)
    .find("a")
    .attr("href");
  const originalNewsInLevel = await newsInLevelsModel.findOne({ level1Url });
  console.log(`Original news in level: ${originalNewsInLevel}`);
  console.log({ cover, title, excerpt, level1Url, level2Url, level3Url });
  if (!originalNewsInLevel) {
    const newsInLevel = await newsInLevelsModel.create({
      cover,
      title,
      excerpt,
      level1Url,
      level2Url,
      level3Url,
    });
  }
}

router.post("/grab/newsinlevels", async function (req, res, next) {
  try {
    const { url } = req.body;
    const requestUrl = url || `https://www.newsinlevels.com/#/`;
    console.log(url, requestUrl);
    const d = await axios({ url: requestUrl });
    const $ = cheerio.load(d.data);
    const newsItemList = $(
      ".home-in .container .row .main-content .recent-news .news-block"
    );
    newsItemList.each(async (index, element) => {
      await parseNewsInLevelsItemAndCreate(newsItemList.eq(index).html());
    });
    res.json(generateResponse());
  } catch (error) {
    res.json(ut.generateBadResponse());
  }
});

router.post("/parse/newsinlevels", async function (req, res, next) {
  const url = `https://www.newsinlevels.com/products/same-sex-marriage-in-india-level-1/#/`;
  const a = await axios.get(url);
  const $ = cheerio.load(a.data);
  console.log(a.data);
  res.json(generateResponse());
});

router.post("/guardian", async function (req, res, next) {
  console.log("sdjfasldjfalsd;f");
  const { title, summary, originalUrl, content, groupId } = req.body;
  const userId = req.tUser._id;
  const existGuardianList = await theGuardianModel.find(
    {
      groupId,
      author: userId,
    },
    "_id title"
  );
  if (existGuardianList.length > 0) {
    res.json(existGuardianList[0]);
  } else {
    if (title && content && groupId && originalUrl && req.tUser) {
      const t = await theGuardianModel.create({
        title,
        summary,
        content,
        groupId,
        author: userId,
        originalUrl,
      });
      res.json(generateResponse(t));
    } else {
      res.json(generateBadResponse());
    }
  }
});

router.get("/guardian", async function (req, res, next) {
  const userId = req.tUser._id;
  // const r = await theGuardianModel.find({ author: userId }, "_id title questions").exec();
  const r = await theGuardianModel.aggregate([
    {
      // 添加一个新的字段 'date'，仅包含日期部分
      $addFields: {
        date: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
      },
    },
    {
      // 筛选需要的字段
      $project: {
        date: 1,
        title: 1,
        author: 1,
        summary: 1,
        questions: 1,
        _id: 1,
        createdAt: 1,
      },
    },
    {
      // 按照 'date' 字段进行分组
      $group: {
        _id: "$date",
        count: { $sum: 1 }, // 计算每个日期的文档数量
        documents: {
          $push: {
            _id: "$_id",
            title: "$title",
            author: "$author",
            questions: "$questions",
            summary: "$summary",
          },
        },
      },
    },
    {
      // 按日期升序排序
      $sort: { _id: 1 },
    },
  ]);

  res.json(generateResponse(r));
});

router.get("/guardian/:id", async function (req, res, next) {
  const id = req.params.id;
  const t = await theGuardianModel.findById(id);
  if (t) {
    res.json(generateResponse(t));
  } else {
    res.json(generateBadResponse());
  }
});

// Get article detail
// 这个路由会与/article/guardian这样的路由冲突
router.get("/:id", async function (req, res, next) {
  try {
    let t = await articleModel.findById(req.params.id).exec();
    res.json(generateResponse(t));
  } catch (error) {
    res.json(generateResponse("", 400, "fail"));
  }
});
module.exports = router;
