const { ObjectId } = require("mongodb");
const { Schema, default: mongoose } = require("mongoose");

const tokenSchema = new Schema({
  text: String,
  isHightLight: Boolean,
});

const articleTokenSchema = new Schema({
  articleId: ObjectId,
  tokens: {
    // tStartTime作为key
    type: Map,
    of: [tokenSchema],
  },
});

const articleTokenModel = mongoose.model("ArticleToken", articleTokenSchema);

module.exports = { articleTokenModel };
