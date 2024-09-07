const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const { Schema } = mongoose;

const wordGroupSchema = new Schema(
  {
    // 用作标识group是否唯一
    name: { type: String, default: "Default" },
    // 使用浏览器插件查询单词的时候获取到的当前页面的url
    originalPageUrl: { type: String, default: "" },
    // 词组被创建的来源,是浏览器插件功能自动创建的，还是手动创建的，还是在stylish reader官网上youtube视频创建的
    createdSource: {
      type: String,
      enum: ["extension", "manually"],
      required: true,
    },
    // 用作页面上显示的名字
    nickName: { type: String, default: "Default" },
    // 是否时官方的词组
    isOfficial: { type: Boolean, default: false },
    creator: ObjectId,
    groupDescription: { type: String, default: "Group description." },
    groupCoverUrl: { type: String, default: "" },
    groupVideoUrl: { type: String, default: "" },
    groupAudioUrl: { type: String, default: "" },
    groupArticleUrl: { type: String, default: "" },
    parentGroupID: { type: String, default: "" },
    isPublic: { type: Boolean, default: false },
    wordCount: { type: Number, default: 0 },
    // 词组对应的文章，视频链接，等所有资料链接
    links: { type: Array, default: [] },
    // 通过 stylish reader 网站的youtube视频添加的词组，会有这个字段
    youtubeId: { type: String, default: "" },
  },
  {
    timestamps: true,
    statics: {
      getGroupByNameAndUserId(name, user) {
        return this.find({ name, creator: user._id });
      },
      getGroupsByOriginalPageUrlAndUserId(originalPageUrl, user) {
        return this.find({ originalPageUrl, creator: user._id });
      },
      getOnlyChildGroup(creator) {
        return mongoose.model("WordGroup").find({
          creator: creator,
          parentGroupID: { $ne: "" },
        });
      },
      getPublicGroup() {
        return mongoose.model("WordGroup").find({
          isPublic: true,
          parentGroupID: { $ne: "" },
        });
      },
      getOnlyParentGroup(creator) {
        return mongoose
          .model("WordGroup")
          .find({ creator })
          .where("parentGroupID")
          .equals("");
      },
    },
  }
);

const wordGroupModel = mongoose.model("WordGroup", wordGroupSchema);

module.exports = { wordGroupModel };
