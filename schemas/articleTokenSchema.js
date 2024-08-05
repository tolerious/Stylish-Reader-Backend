const { ObjectId } = require("mongodb");
const { Schema, default: mongoose } = require("mongoose");

const tokenSchema = new Schema({
  text: String,
  isHightLight: { type: Boolean, default: false },
  uuid: String,
});

const articleTokenSchema = new Schema({
  articleId: ObjectId,
  youtubeVideoId: String,
  tokens: {
    // tStartTime作为key
    type: Map,
    of: { originTextString: String, segs: [tokenSchema] },
  },
});

const articleTokenModel = mongoose.model("ArticleToken", articleTokenSchema);

module.exports = { articleTokenModel };
