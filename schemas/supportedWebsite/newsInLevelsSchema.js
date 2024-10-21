const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const { Schema } = mongoose;
const newsInLevelsSchema = new Schema(
  {
    title: String,
    cover: String,
    excerpt: String,
    level1Url: String,
    level2Url: String,
    level3Url: String,
  },

  {
    timestamps: true,
  }
);

const newsInLevelsModel = mongoose.model("NewsInLevels", newsInLevelsSchema);

module.exports = { newsInLevelsModel };
