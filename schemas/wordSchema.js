const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const { Schema } = mongoose;
const wordSchema = new Schema(
  {
    creator: ObjectId,
    en: String,
    groupID: ObjectId,
  },
  {
    timestamps: true,
    statics: {
      getWordListCount() {
        return mongoose.model("Word").find({}).count();
      },
      getWordList(pageSize = 10, pageNo = 1) {
        return mongoose
          .model("Word")
          .find({}, null, { skip: pageSize * (pageNo - 1), limit: pageSize });
      },
      getWord(id) {
        return mongoose.model("Word").findOne({ _id: id });
      },
      getOneWord() {},
      getWordByGroup(groupID) {
        return mongoose.model("Word").find({ groupID });
      },
    },
  }
);

const wordModel = mongoose.model("Word", wordSchema);

module.exports = { wordModel };
