const mongoose = require("mongoose");

const { Schema } = mongoose;
const coverSchema = new Schema({ url: String });
const theGuardianSchema = new Schema(
  {
    title: String,
    author: mongoose.ObjectId,
    groupId: mongoose.ObjectId,
    cover: [coverSchema],
    summary: String,
    content: String,
  },

  {
    timestamps: true,
  }
);

const theGuardianModel = mongoose.model("TheGuardian", theGuardianSchema);

module.exports = { theGuardianModel };
