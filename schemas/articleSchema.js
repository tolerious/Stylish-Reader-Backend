const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const { Schema } = mongoose;

const articleSchema = new Schema(
  {
    creator: ObjectId,
    title: String,
    author: String,
    content: String,
    cover: String,
    tags: [String],
    /** 文章链接 */
    link: { type: String, default: "" },
    // 以下字段仅针对Youtube网站
    /** 英文字幕 */
    enTranscriptData: { type: String, default: "" },
    /** 中文字幕 */
    cnTranscriptData: { type: String, default: "" },
    /** 只针对YouTube网站有效 */
    youtubeVideoId: { type: String, default: "" },
    // 是否转换完成
    isTransformed: { type: Boolean, default: false },
  },

  {
    timestamps: true,
    statics: {
      async searchArticleByCreatorAndLink(creator, link) {
        let r = await articleModel.find({ creator, link });
        return r;
      },
      async searchArticleByContent(content, pageNo = 0, pageSize = 10) {
        let orList = content.map((item) => {
          let reg = new RegExp(item, "i");
          return { content: reg };
        });
        let results = await mongoose.model("Article").aggregate([
          {
            $match: {
              $or: orList,
            },
          },
          { $limit: pageSize },
          { $skip: pageSize * pageNo },
        ]);

        let count = await mongoose.model("Article").aggregate([
          {
            $match: {
              $or: orList,
            },
          },
          {
            $count: "total",
          },
        ]);

        return {
          total: count[0] ? count[0].total : 0,
          pageSize: pageSize,
          list: results,
          pageNo,
        };
      },
    },
    virtuals: {
      basicInfo: {
        get() {
          return this.title + " " + this.author;
        },
      },
    },
    methods: {},
  }
);

const articleModel = mongoose.model("Article", articleSchema);

module.exports = { articleModel };
